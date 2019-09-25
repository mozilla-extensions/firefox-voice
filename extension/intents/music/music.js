/* globals intentRunner, serviceList */

this.intents.music = (function() {
  const exports = {};
  const SERVICES = {};
  exports.register = function(service) {
    SERVICES[service.id] = service;
  };

  intentRunner.registerIntent({
    name: "music.play",
    examples: ["Play Green Day"],
    match: `
    play [query]
    `,
    async run(context) {
      const Service = await serviceList.getService("music", SERVICES);
      const service = new Service(context);
      await service.playQuery(context.slots.query);
    },
  });

  intentRunner.registerIntent({
    name: "music.pause",
    examples: ["Pause music"],
    match: `
    pause music
    stop music
    `,
    async run(context) {
      const Service = await serviceList.getService("music", SERVICES);
      const service = new Service(context);
      await service.pause();
    },
  });

  intentRunner.registerIntent({
    name: "music.unpause",
    examples: ["Unpause", "continue music", "play music"],
    match: `
    unpause
    continue music
    play music
    `,
    priority: "high",
    async run(context) {
      const Service = await serviceList.getService("music", SERVICES);
      const service = new Service(context);
      await service.unpause();
    },
  });

  intentRunner.registerIntent({
    name: "music.focus",
    examples: ["Open music"],
    match: `
    open music
    show music
    focus music
    `,
    async run(context) {
      const Service = await serviceList.getService("music", SERVICES);
      const service = new Service(context);
      await service.activateOrOpen();
    },
  });

  return exports;
})();
