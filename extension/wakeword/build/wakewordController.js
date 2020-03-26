/* globals ReactDOM */
import * as settings from "../settings.js";
import { updateWakeword } from "../recorder/wakeword.js"; // eslint-disable-next-line no-unused-vars

import { WakewordView } from "./wakewordView.js";
const wakewordContainer = document.getElementById("wakeword-container");
export const WakewordController = function ({
  userSettings
}) {
  return React.createElement(WakewordView, {
    userSettings: userSettings
  });
};

async function render() {
  const userSettings = await settings.getSettings();
  ReactDOM.render(React.createElement(WakewordController, {
    userSettings: userSettings
  }), wakewordContainer);
  setTimeout(() => {
    updateWakeword();
  }, 500);
}

render();
browser.runtime.onMessage.addListener(message => {
  if (message.type === "updateWakeword") {
    return Promise.resolve(render());
  }

  return undefined;
});