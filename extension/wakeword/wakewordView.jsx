/* eslint-disable no-unused-vars */
import * as browserUtil from "../browserUtil.js";

export const WakewordView = ({ userSettings, suggestions }) => {
  if (!userSettings.enableWakeword) {
    return <WakewordDisabled />;
  }
  return (
    <ListeningWakeword
      wakewords={userSettings.wakewords}
      suggestions={suggestions}
    />
  );
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

const ListeningWakeword = ({ wakewords, suggestions }) => {
  return (
    <div class="wakeword-wrapper">
      <div id="wakeword-tab-info">
        <div id="tab-info">What's this tab?</div>
        <div id="tab-info-details">
          <div>
            Firefox Voice uses this tab for microphone permissions. The
            microphone is listening for you to say “Hey Firefox.” Set a new
            wakeword or disable listening in&nbsp;
            <a
              href="../options/options.html"
              target="_blank"
              onClick={browserUtil.activateTabClickHandler}
            >
              Preferences
            </a>
            .
          </div>
          <div class="privacy">
            <a
              href="/views/privacy-policy.html"
              target="_blank"
              rel="noopener"
              onClick={browserUtil.activateTabClickHandler}
            >
              Learn how Firefox Voice protects your privacy.
            </a>
          </div>
        </div>
      </div>
      <div class="wakeword-content">
        <div class="mic-info">
          <img
            alt="Active microphone icon"
            src="./images/mic-listening.svg"
            className="mic-listening"
          />
          <div class="mic-listening-label">Microphone is listening</div>

          <p class="wakeword-info">
            Until you say “Hey Firefox” or click the icon, your voice is not
            recorded, stored, transcribed or transmitted from your computer.
          </p>
        </div>
        <div class="cta">
          <h3 class="example-cta">Try saying things like</h3>
          {suggestions.map(suggestion => (
            <div class="wakeword-example" key={suggestion}>
              Hey Firefox,{" "}
              {suggestion.charAt(0).toLowerCase() + suggestion.slice(1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
