/* eslint-disable no-unused-vars */

export const WakewordView = ({ userSettings }) => {
  if (!userSettings.enableWakeword || userSettings.wakewords.length === 0) {
    return <WakewordDisabled />;
  }
  return <ListeningWakeword wakewords={userSettings.wakewords} />;
};

async function openLink(event) {
  event.preventDefault();
  const url = event.target.href;
  browser.tabs.create({ url });
  return false;
}

const WakewordDisabled = () => {
  return (
    <div>
      <p>Listening for a keyword has been disabled.</p>
      <p>
        <a
          href="../options/options.html"
          target="_blank"
          className="styled-button"
          onClick={openLink}
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
        <a href="../options/options.html" target="_blank" onClick={openLink}>
          update your settings
        </a>
        .
      </p>
    </div>
  );
};
