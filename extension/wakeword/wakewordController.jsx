/* globals ReactDOM */
import * as settings from "../settings.js";
import { updateWakeword } from "../recorder/wakeword.js";
import { sendMessage } from "../communicate.js";
// eslint-disable-next-line no-unused-vars
import { WakewordView } from "./wakewordView.js";

const wakewordContainer = document.getElementById("wakeword-container");

export const WakewordController = function({ userSettings, suggestions }) {
  return <WakewordView userSettings={userSettings} suggestions={suggestions} />;
};

async function render() {
  const userSettings = await settings.getSettings();
  const suggestions = await sendMessage({
    type: "getExamples",
    number: 3,
  });

  ReactDOM.render(
    <WakewordController
      userSettings={userSettings}
      suggestions={suggestions}
    />,
    wakewordContainer
  );
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
