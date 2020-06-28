/* globals log */

import * as pageMetadata from "../../background/pageMetadata.js";
import * as intentRunner from "../../background/intentRunner.js";
import * as serviceList from "../../background/serviceList.js";
import * as browserUtil from "../../browserUtil.js";

const SERVICES = {};

export function register(service) {
  if (!service.id) {
    log.error("Bad email service, no id:", service);
    throw new Error("Invalid service: no id");
  }
  if (SERVICES[service.id]) {
    throw new Error(
      `Attempt to register two email services with id ${service.id}`
    );
  }
  SERVICES[service.id] = service;
}

async function getService(context, options) {
  let ServiceClass;
  const explicitService = context.slots.service || context.parameters.service;
  options.defaultService = options.defaultService || "gmail";
  if (explicitService) {
    ServiceClass = SERVICES[serviceList.mapEmailServiceName(explicitService)];
    if (!ServiceClass) {
      throw new Error(
        `[service] slot refers to unknown service: ${explicitService}`
      );
    }
  } else {
    ServiceClass = await serviceList.getService(
      "emailService",
      SERVICES,
      options
    );
  }
  return new ServiceClass(context);
}

function normalizeAddress(address) {
  if (!address.includes("@")) {
    address = address.replace(/\s+at\s+/i, "@");
  }
  address = address.replace(/\s+/g, "");
  return address;
}

intentRunner.registerIntent({
  name: "email.compose",
  async run(context) {
    const service = await getService(context, { lookAtCurrentTab: false });
    let subject = context.slots.subject;
    if (subject && subject.toLowerCase() === "this") {
      context.parameters.body = "tab";
      subject = null;
    }
    let body = "";
    if (context.parameters.body === "tab") {
      const active = await browserUtil.activeTab();
      const metadata = await pageMetadata.getMetadata(active.id);
      if (!subject) {
        subject = metadata.title;
      }
      body = `${metadata.title}: ${metadata.url}\n\n`;
    }
    await service.compose({
      to: normalizeAddress(context.slots.to),
      subject,
      body,
    });
  },
});
