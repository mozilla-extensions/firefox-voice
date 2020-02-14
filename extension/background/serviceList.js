import * as content from "./content.js";
import * as browserUtil from "../browserUtil.js";
import * as settings from "../settings.js";
import * as util from "../util.js";

// See https://duckduckgo.com/bang for a list of potential services
const SERVICE_BANG_ALIASES = {
  "google slides": "gslides",
  slides: "gslides",
  "google docs": "gd",
  "google scholar": "googlescholar",
  calendar: "gcal",
  "google calendar": "gcal",
  "google drive": "drive",
  "google sheets": "gsheets",
  sheets: "gsheets",
  spreadsheets: "gsheets",
  goodreads: "goodreads",
  mdn: "mdn",
  coursera: "coursera",
  gmail: "gmail",
  mail: "gmail",
  email: "gmail",
  "google mail": "gmail",
  amazon: "az",
  wikipedia: "wikipedia",
  wiki: "wikipedia",
  yelp: "yelp",
  twitter: "twitter",
  reddit: "reddit",
  "amazon music": "amusic",
  "google music": "gmusic",
  "google play music": "gmusic",
  pandora: "pandora",
  soundcloud: "soundcloud",
  "sound cloud": "soundcloud",
  tunein: "tunein",
  "tune in": "tunein",
  "tunein radio": "tunein",
  "tune in radio": "tunein",
  vimeo: "vimeo",
  netflix: "netflix",
  "apple maps": "amaps",
  "google maps": "gmap",
  maps: "gmap",
  "open street maps": "omap",
  "open maps": "omap",
  stubhub: "stubhub",
  "stub hub": "stubhub",
  ticketmaster: "ticketmaster",
  "ticket master": "ticketmaster",
  "google translate": "translate",
  translate: "translate",
  instagram: "instagram",
  insta: "instagram",
  linkedin: "linkedin",
  quora: "quora",
  pinterest: "pin",
  pin: "pin",
  facebook: "facebook",
  stackexchange: "stackexchange",
  "stack exchange": "stackexchange",
  dropbox: "dropbox",
  "dictionary.com": "dcom",
  dictionary: "dcom",
  thesaurus: "thesaurus",
  duckduckgo: "duckduckgo",
  "duck duck go": "duckduckgo",
  "duckduckgo images": "ddgi",
  "duck duck go images": "ddgi",
  "google images": "gi",
  images: "gi",
};

export function allServiceNames() {
  return Object.keys(SERVICE_BANG_ALIASES);
}

export function ddgBangServiceName(name) {
  const bang = SERVICE_BANG_ALIASES[name.toLowerCase().trim()];
  if (!bang) {
    throw new Error(`Unknown service name: ${JSON.stringify(name)}`);
  }
  return bang;
}

const MUSIC_SERVICE_ALIASES = {
  youtube: "youtube",
  spotify: "spotify",
  video: "youtube",
};

const DEFAULT_MUSIC_SERVICE = "spotify";

// Note these are maintained separately from the services in extension/services/*, because
// those are all loaded too late to be used here
export function musicServiceNames() {
  return Object.keys(MUSIC_SERVICE_ALIASES);
}

export function mapMusicServiceName(utterance) {
  return MUSIC_SERVICE_ALIASES[utterance.toLowerCase()];
}

export class Service {
  constructor(context) {
    this.context = context;
    this.tab = null;
    this.context.onError = this.onError.bind(this);
  }

  get id() {
    const id = this.constructor.id;
    if (!id) {
      throw new Error(`Class has no id: ${this.constructor.name}`);
    }
    return id;
  }

  get baseUrl() {
    return this.constructor.baseUrl;
  }

  onError(message) {
    if (this.tab) {
      this.activateTab();
    }
  }

  async activateTab() {
    if (!this.tab) {
      throw new Error("No tab to activate");
    }
    this.context.makeTabActive(this.tab.id);
  }

  get matchPatterns() {
    const url = new URL(this.baseUrl);
    if (url.pathname && url.pathname !== "/") {
      const path = url.pathname.replace(/\/+$/, "");
      return [
        `${url.protocol}//${url.hostname}${path}`,
        `${url.protocol}//${url.hostname}${path}/*`,
      ];
    }
    return [`${url.protocol}//${url.hostname}/*`];
  }

  async activateOrOpen() {
    return (await this.getTab(true)).tab;
  }

  async getTab(activate = false) {
    const tabs = await this.getAllTabs();
    if (!tabs.length) {
      return {
        created: true,
        tab: await this.context.createTab({
          url: this.baseUrl,
          active: activate,
        }),
      };
    }
    let best = 0;
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].active) {
        best = i;
      }
    }
    if (activate) {
      await this.context.makeTabActive(tabs[best]);
    }
    return { created: false, tab: tabs[best] };
  }

  async getAllTabs(extraQuery) {
    const query = Object.assign({ url: this.matchPatterns }, extraQuery || {});
    return browser.tabs.query(query);
  }

  async initTab(scripts) {
    const tabInfo = await this.getTab();
    this.tab = tabInfo.tab;
    this.tabCreated = tabInfo.created;
    await content.lazyInject(this.tab.id, scripts);
  }

  callTab(name, args) {
    return this.callOneTab(this.tab.id, name, args);
  }

  async callOneTab(tabId, name, args) {
    args = args || {};
    const response = browser.tabs.sendMessage(tabId, {
      type: name,
      ...args,
    });
    if (
      response &&
      typeof response === "object" &&
      response.status === "error"
    ) {
      const e = new Error(response.message);
      for (const name in response) {
        if (name !== "status" && name !== "message") {
          e[name] = response[name];
        }
      }
      throw e;
    }
    return response;
  }

  async pollTabAudible(tabId, timeout) {
    return util.trySeveralTimes({
      func: async () => {
        const tab = await browser.tabs.get(tabId);
        if (tab.audible) {
          return true;
        }
        return undefined;
      },
      returnOnTimeout: false,
      timeout,
    });
  }
}

export async function detectServiceFromActiveTab(services) {
  const tab = await browserUtil.activeTab();
  for (const name in services) {
    const service = services[name];
    if (tab.url.startsWith(service.baseUrl)) {
      return name;
    }
  }
  return null;
}

export async function detectServiceFromHistory(services) {
  const now = Date.now();
  const oneMonth = now - 1000 * 60 * 60 * 24 * 30; // last 30 days
  let best = DEFAULT_MUSIC_SERVICE;
  let bestScore = 0;
  for (const name in services) {
    const service = services[name];
    if (service.skipAutodetect) {
      continue;
    }
    if (!service.baseUrl) {
      throw new Error(`Service ${service.name} has no .baseUrl`);
    }
    const history = await browser.history.search({
      text: service.baseUrl,
      startTime: oneMonth,
    });
    let score = 0;
    for (const item of history) {
      if (!item.url.startsWith(service.baseUrl)) {
        continue;
      }
      const daysAgo = (now - item.lastVisitTime) / (1000 * 60 * 60 * 24);
      score +=
        (100 - daysAgo) * item.visitCount * (10 + (item.typedCount || 1));
    }
    if (score > bestScore) {
      bestScore = score;
      best = name;
    }
  }
  return best;
}

export async function getService(serviceType, serviceMap, options) {
  // TODO: serviceType should be used to store a preference related to this service
  // (which would override any automatic detection).
  const serviceSetting = settings.getSettings()[serviceType];
  options = options || {};
  if (options.lookAtCurrentTab) {
    const serviceName = await exports.detectServiceFromActiveTab(serviceMap);
    if (serviceName) {
      return serviceMap[serviceName];
    }
  }
  if (serviceSetting && serviceSetting !== "auto") {
    return serviceMap[serviceSetting];
  }
  const serviceName = await exports.detectServiceFromHistory(serviceMap);
  const ServiceClass = serviceMap[serviceName];
  if (!ServiceClass) {
    throw new Error(
      `detectServiceFromHistory did not return service (${serviceName})`
    );
  }
  return ServiceClass;
}
