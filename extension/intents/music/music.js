/* globals intentRunner, serviceList, log, intents */

this.intents.music = (function() {
  const exports = {};
  const SERVICES = {};
  exports.register = function(service) {
    if (!service.id) {
      log.error("Bad music service, no id:", service);
      throw new Error("Invalid service: no id");
    }
    if (SERVICES[service.id]) {
      throw new Error(
        `Attempt to register two music services with id ${service.id}`
      );
    }
    SERVICES[service.id] = service;
  };

  exports.getServiceNamesAndTitles = function() {
    let names = Object.keys(SERVICES);
    names.sort();
    names = names.filter(name => !SERVICES[name].skipAutodetect);
    const services = names.map(name => {
      return { name, title: SERVICES[name].title };
    });
    services.unshift({ name: "auto", title: "Detect service" });
    return services;
  };

  async function getService(context, options) {
    let ServiceClass;
    const explicitService = context.slots.service || context.parameters.service;
    if (explicitService) {
      ServiceClass = SERVICES[serviceList.mapMusicServiceName(explicitService)];
      if (!ServiceClass) {
        throw new Error(
          `[service] slot refers to unknown service: ${explicitService}`
        );
      }
    } else {
      ServiceClass = await serviceList.getService(
        "musicService",
        SERVICES,
        options
      );
    }
    return new ServiceClass(context);
  }

  async function pauseAnyButService(context, serviceId) {
    for (const ServiceClass of Object.values(SERVICES)) {
      if (ServiceClass.id === serviceId) {
        continue;
      }
      const service = new ServiceClass(context);
      await service.pauseAny();
    }
  }

  async function pauseAnyButTab(context, tabId) {}

  intentRunner.registerIntent({
    name: "music.play",
    examples: ["Play Green Day"],
    match: `
    play [query] on [service:musicServiceName]
    play video [query] [service=youtube]
    play [query] video [service=youtube]
    play [query]
    (do a |) (search on | query on | lookup on | look up on | look on | look in | look up in | lookup in) (my |) [service:musicServiceName] (for | for the |) [query]
    (do a |) (search | query ) my [service:musicServiceName] (for | for the |) [query]
    (do a |) (search | query | find | find me | look up | lookup | look on | look for) (my | on | for | in |) (the |) [query] (on | in) [service:musicServiceName]
    `,
    async run(context) {
      const service = await getService(context, { lookAtCurrentTab: true });
      await service.playQuery(context.slots.query);
      // FIXME: this won't pause other YouTube tabs when you play a new YouTube tab,
      // though maybe YouTube should handle that itself?
      if (service.tab) {
        await pauseAnyButTab(context, service.tab.id);
      } else {
        await pauseAnyButService(context, service.id);
      }
    },
  });

  intentRunner.registerIntent({
    name: "music.pause",
    examples: ["Pause music"],
    match: `
    (stop | pause) video [service=youtube]
    pause [service:musicServiceName]
    pause (music |)
    stop (music |)
    `,
    async run(context) {
      for (const ServiceClass of Object.values(SERVICES)) {
        const service = new ServiceClass(context);
        await service.pauseAny();
      }
    },
  });

  intentRunner.registerIntent({
    name: "music.unpause",
    examples: ["Unpause", "continue music", "play music"],
    match: `
    (unpause | continue | play) video [service=youtube]
    (unpause | continue | play) [service:musicServiceName]
    unpause
    (continue | play) music
    `,
    async run(context) {
      const service = await getService(context, { lookAtCurrentTab: true });
      await service.unpause();
    },
  });

  intentRunner.registerIntent({
    name: "music.focus",
    examples: ["Open music"],
    match: `
    (open | show | focus) video [service=youtube]
    open [service:musicServiceName]
    show [service:musicServiceName]
    focus [service:musicServiceName]
    open music
    show music
    focus music
    `,
    async run(context) {
      const service = await getService(context);
      await service.activateOrOpen();
    },
  });

  intentRunner.registerIntent({
    name: "music.move",
    examples: ["next", "previous"],
    match: `
    (play |) next video               [direction=next] [service=youtube]
    skip video                        [direction=next] [service=youtube]
    (play |) previous video           [direction=back] [service=youtube]
    play next (song | track |)        [direction=next]
    next (song | track |)             [direction=next]
    play previous (song | track |)    [direction=back]
    previous (song | track |)         [direction=back]
    skip (song | track |)             [direction=next]
    `,
    async run(context) {
      const service = await getService(context, { lookAtCurrentTab: true });
      await service.move(context.parameters.direction);
    },
  });

  return exports;
})();
