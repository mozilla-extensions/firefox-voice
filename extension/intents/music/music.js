/* globals intentRunner, serviceList, log */

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

  async function getService(context) {
    let ServiceClass;
    if (context.slots.service) {
      ServiceClass = SERVICES[context.slots.service.toLowerCase()];
      if (!ServiceClass) {
        throw new Error(
          `[service] slot refers to unknown service: ${context.slots.service}`
        );
      }
    } else {
      ServiceClass = await serviceList.getService("music", SERVICES);
    }
    return new ServiceClass(context);
  }

  intentRunner.registerIntent({
    name: "music.play",
    examples: ["Play Green Day"],
    match: `
    play [query] on [service:musicServiceName]
    play [query]
    `,
    async run(context) {
      const service = await getService(context);
      await service.playQuery(context.slots.query);
    },
  });

  intentRunner.registerIntent({
    name: "music.pause",
    examples: ["Pause music"],
    match: `
    pause [service:musicServiceName]
    pause music
    stop music
    `,
    async run(context) {
      const service = await getService(context);
      await service.pause();
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
    priority: "high",
    async run(context) {
      const service = await getService(context);
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

  return exports;
})();
