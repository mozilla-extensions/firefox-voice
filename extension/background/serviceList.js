import * as content from "./content.js";
import * as browserUtil from "../browserUtil.js";
import * as settings from "../settings.js";
import * as util from "../util.js";

const MUSIC_SERVICE_ALIASES = {
  youtube: "youtube",
  spotify: "spotify",
  soundcloud: "soundcloud",
  deezer: "deezer",
  video: "youtube",
};

// Note these are maintained separately from the services in extension/services/*, because
// those are all loaded too late to be used here
export function musicServiceNames() {
  return Object.keys(MUSIC_SERVICE_ALIASES);
}

export function mapMusicServiceName(utterance) {
  return MUSIC_SERVICE_ALIASES[utterance.toLowerCase()];
}

const EMAIL_SERVICE_ALIAS = {
  gmail: "gmail",
  "google mail": "gmail",
};

export function mapEmailServiceName(utterance) {
  return EMAIL_SERVICE_ALIAS[utterance.toLowerCase()];
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
    browserUtil.makeTabActive(this.tab.id);
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

  async getTab(activate = false, findAudibleTab = false) {
    const tabs = await this.getAllTabs();
    if (!tabs.length) {
      return {
        created: true,
        tab: await browserUtil.createAndLoadTab({
          url: this.baseUrl,
          active: activate,
        }),
      };
    }
    let best = 0;
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].active || (findAudibleTab && tabs[i].audible === true)) {
        best = i;
      }
    }
    if (activate) {
      await browserUtil.makeTabActive(tabs[best]);
    }
    return { created: false, tab: tabs[best] };
  }

  async getAllTabs(extraQuery) {
    const query = Object.assign({ url: this.matchPatterns }, extraQuery || {});
    return browser.tabs.query(query);
  }

  async initTab(scripts, findAudibleTab) {
    const tabInfo = await this.getTab(false, findAudibleTab);
    this.tab = tabInfo.tab;
    this.tabCreated = tabInfo.created;
    await content.inject(this.tab.id, scripts);
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
  let serviceName = null;
  const tab = await browserUtil.activeTab();
  for (const name in services) {
    const service = services[name];
    if (tab.url.startsWith(service.baseUrl)) {
      // Continue in case there is another more specific
      // search provider that also matches the query string
      if (service.baseUrlQueryParameters === undefined) {
        serviceName = name;
        continue;
      }

      const searchParams = new URL(tab.url).searchParams;
      let allKeysMatching = true;
      for (const key in service.baseUrlQueryParameters) {
        if (searchParams.get(key) !== service.baseUrlQueryParameters[key]) {
          allKeysMatching = false;
          break;
        }
      }
      if (allKeysMatching === true) {
        return name;
      }
    }
  }
  return serviceName;
}

export async function detectServiceFromAllTabs(services) {
  const tabs = await browser.tabs.query({ audible: true });
  if (!tabs.length) {
    const e = new Error("No audio is playing");
    e.displayMessage = "No audio is playing";
    throw e;
  }
  for (const name in services) {
    const service = services[name];
    if (tabs[0].url.startsWith(service.baseUrl)) {
      return name;
    }
  }
  return null;
}

export async function detectServiceFromHistory(services, defaultService) {
  const now = Date.now();
  const oneMonth = now - 1000 * 60 * 60 * 24 * 30; // last 30 days
  let best = defaultService;
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
    const serviceName = await detectServiceFromActiveTab(serviceMap);
    if (serviceName) {
      return serviceMap[serviceName];
    }
  }

  if (options.lookAtAllTabs) {
    const serviceName = await detectServiceFromAllTabs(serviceMap);
    if (serviceName) {
      return serviceMap[serviceName];
    }
  }

  if (serviceSetting && serviceSetting !== "auto") {
    return serviceMap[serviceSetting];
  }
  const serviceName = await detectServiceFromHistory(
    serviceMap,
    options.defaultService
  );
  const ServiceClass = serviceMap[serviceName];
  if (!ServiceClass) {
    throw new Error(
      `detectServiceFromHistory did not return service (${serviceName})`
    );
  }
  return ServiceClass;
}
