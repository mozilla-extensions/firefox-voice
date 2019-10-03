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

  async function getService(context, options) {
    let ServiceClass;
    if (context.slots.service) {
      ServiceClass = SERVICES[context.slots.service.toLowerCase()];
      if (!ServiceClass) {
        throw new Error(
          `[service] slot refers to unknown service: ${context.slots.service}`
        );
      }
    } else {
      ServiceClass = await serviceList.getService("music", SERVICES, options);
    }
    return new ServiceClass(context);
  }

  async function pauseAnyBut(context, serviceId) {
    for (const ServiceClass of Object.values(SERVICES)) {
      if (ServiceClass.id === serviceId) {
        continue;
      }
      const service = new ServiceClass(context);
      await service.pauseAny();
    }
  }

  intentRunner.registerIntent({
    name: "music.play",
    examples: ["Play Green Day"],
    match: `
    play [query] on [service:musicServiceName]
    play [query]
    `,
    async run(context) {
      const service = await getService(context, { lookAtCurrentTab: true });
      await service.playQuery(context.slots.query);
      // FIXME: this won't pause other YouTube tabs when you play a new YouTube tab,
      // though maybe YouTube should handle that itself?
      await pauseAnyBut(context, service.id);
      await intents.read.pauseAny();
    },
  });

  intentRunner.registerIntent({
    name: "music.pause",
    examples: ["Pause music"],
    match: `
    pause [service:musicServiceName]
    pause (music |)
    stop (music |)
    `,
    async run(context) {
      for (const ServiceClass of Object.values(SERVICES)) {
        const service = new ServiceClass(context);
        await service.pauseAny();
      }
      await intents.read.pauseAny();
    },
  });

  intentRunner.registerIntent({
    name: "music.unpause",
    examples: ["Unpause", "continue music", "play music"],
    match: `
    unpause [service:musicServiceName]
    continue [service:musicServiceName]
    play [service:musicServiceName]
    unpause
    continue music
    play music
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
