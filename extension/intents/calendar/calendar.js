/* globals log */

import * as intentRunner from "../../background/intentRunner.js";
import * as serviceList from "../../background/serviceList.js";

const SERVICES = {};

export function register(service) {
  if (!service.id) {
    log.error("Bad calendar service, no id:", service);
    throw new Error("Invalid service: no id");
  }
  if (SERVICES[service.id]) {
    throw new Error(
      `Attempt to register two calendar services with id ${service.id}`
    );
  }
  SERVICES[service.id] = service;
}

async function getService(context, options) {
  let ServiceClass;
  const explicitService = context.slots.service || context.parameters.service;
  options.defaultService = options.defaultService || "gcal";
  if (explicitService) {
    ServiceClass = SERVICES[serviceList.mapCalendarServiceName(explicitService)];
    if (!ServiceClass) {
      throw new Error(
        `[service] slot refers to unknown service: ${explicitService}`
      );
    }
  } else {
    ServiceClass = await serviceList.getService(
      "calendarService",
      SERVICES,
      options
    );
  }
  return new ServiceClass(context);
}

intentRunner.registerIntent({
  name: "calendar.nextEvent",
  async run(context) {
    const service = await getService(context, { lookAtCurrentTab: true });
    const nextEventDetails = await service.getNextEventDetails();
    console.log("i got to here");
    console.log(nextEventDetails);
    context.displayText(nextEventDetails.toString());
    context.speakTts({
      ttsText: nextEventDetails.length + " items",
      ttsLang: 'en'
    });
  },
});
