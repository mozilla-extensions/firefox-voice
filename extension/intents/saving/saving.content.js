/* globals freezeDry */

import { registerHandler } from "../../background/communicate.js";
import { getMetadata } from "../../background/pageMetadata.content.js";
import { visibleScreenshot, fullPageScreenshot } from "./screenshots.js";

registerHandler("freezeHtml", async message => {
  const html = await freezeDry.default();
  const metadata = getMetadata();
  return { html, metadata };
});

registerHandler("screenshot", async message => {
  const metadata = getMetadata();
  const png = visibleScreenshot();
  return { png, metadata };
});

registerHandler("screenshotFullPage", async message => {
  const metadata = getMetadata();
  const png = fullPageScreenshot();
  return { png, metadata };
});
