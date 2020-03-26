/* eslint-disable no-unused-vars */
import * as browserUtil from "../browserUtil.js";
export const WakewordView = ({
  userSettings
}) => {
  if (!userSettings.enableWakeword || userSettings.wakewords.length === 0) {
    return React.createElement(WakewordDisabled, null);
  }

  return React.createElement(ListeningWakeword, {
    wakewords: userSettings.wakewords
  });
};

const WakewordDisabled = () => {
  return React.createElement("div", null, React.createElement("p", null, "Listening for a keyword has been disabled."), React.createElement("p", null, React.createElement("a", {
    href: "../options/options.html",
    target: "_blank",
    className: "styled-button",
    onClick: browserUtil.activateTabClickHandler
  }, "Open settings to enable")));
};

const ListeningWakeword = ({
  wakewords
}) => {
  return React.createElement("div", null, wakewords.length === 1 ? React.createElement("p", null, "Listening for ", React.createElement("strong", null, wakewords[0])) : React.createElement("p", null, "Listening for any of the words:", " ", React.createElement("strong", null, wakewords.join(", "))), React.createElement("p", null, "Note if you close this window the keyword activation will be disabled until you manually open the tool."), React.createElement("p", null, "If you wish to permanently disable the wakeword then", " ", React.createElement("a", {
    href: "../options/options.html",
    target: "_blank",
    onClick: browserUtil.activateTabClickHandler
  }, "update your settings"), "."));
};