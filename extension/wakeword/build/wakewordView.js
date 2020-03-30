/* eslint-disable no-unused-vars */
import * as browserUtil from "../browserUtil.js";
export const WakewordView = ({
  userSettings
}) => {
  if (!userSettings.enableWakeword || userSettings.wakewords.length === 0) {
    return /*#__PURE__*/React.createElement(WakewordDisabled, null);
  }

  return /*#__PURE__*/React.createElement(ListeningWakeword, {
    wakewords: userSettings.wakewords
  });
};

const WakewordDisabled = () => {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Listening for a keyword has been disabled."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("a", {
    href: "../options/options.html",
    target: "_blank",
    className: "styled-button",
    onClick: browserUtil.activateTabClickHandler
  }, "Open settings to enable")));
};

const ListeningWakeword = ({
  wakewords
}) => {
  return /*#__PURE__*/React.createElement("div", null, wakewords.length === 1 ? /*#__PURE__*/React.createElement("p", null, "Listening for ", /*#__PURE__*/React.createElement("strong", null, wakewords[0])) : /*#__PURE__*/React.createElement("p", null, "Listening for any of the words:", " ", /*#__PURE__*/React.createElement("strong", null, wakewords.join(", "))), /*#__PURE__*/React.createElement("p", null, "Note if you close this window the keyword activation will be disabled until you manually open the tool."), /*#__PURE__*/React.createElement("p", null, "If you wish to permanently disable the wakeword then", " ", /*#__PURE__*/React.createElement("a", {
    href: "../options/options.html",
    target: "_blank",
    onClick: browserUtil.activateTabClickHandler
  }, "update your settings"), "."));
};