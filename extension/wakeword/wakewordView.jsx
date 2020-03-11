/* eslint-disable no-unused-vars */
import * as browserUtil from "../browserUtil.js";

export const WakewordView = ({ userSettings }) => {
  if (!userSettings.enableWakeword || userSettings.wakewords.length === 0) {
    return <WakewordDisabled />;
  }
  return <ListeningWakeword wakewords={userSettings.wakewords} />;
};

const WakewordDisabled = () => {
  return (
    <div>
      <p>Listening for a keyword has been disabled.</p>
      <p>
        <a
          href="../options/options.html"
          target="_blank"
          className="styled-button"
          onClick={browserUtil.activateTabClickHandler}
        >
          Open settings to enable
        </a>
      </p>
    </div>
  );
};

const ListeningWakeword = ({ wakewords }) => {
  return (
    <div>
      {wakewords.length === 1 ? (
        <p>
          Listening for <strong>{wakewords[0]}</strong>
        </p>
      ) : (
        <p>
          Listening for any of the words:{" "}
          <strong>{wakewords.join(", ")}</strong>
        </p>
      )}
      <p>
        Note if you close this window the keyword activation will be disabled
        until you manually open the tool.
      </p>
      <p>
        If you wish to permanently disable the wakeword then{" "}
        <a
          href="../options/options.html"
          target="_blank"
          onClick={browserUtil.activateTabClickHandler}
        >
          update your settings
        </a>
        .
      </p>
    </div>
  );
};
