/* eslint-disable no-unused-vars */
/* globals React */

import * as browserUtil from "../browserUtil.js";

const ONBOARDING_WAKEWORD_VIEW = false;

export const Onboarding = ({
  optinTechDataAlreadyShown,
  optinViewAlreadyShown,
  askForAudio,
  setCollectTechData,
  setOptinValue,
  setOptinViewShown,
  permissionError,
  setWakewordOptinValue,
  optinWakewordAlreadyShown,
  wakewordActive,
}) => {
  return (
    <div id="onboarding-wrapper">
      {!optinViewAlreadyShown &&
      !optinWakewordAlreadyShown &&
      ONBOARDING_WAKEWORD_VIEW ? (
        <OptinWakeword setWakewordOptinValue={setWakewordOptinValue} />
      ) : null}
      {!optinViewAlreadyShown &&
      !optinTechDataAlreadyShown &&
      (optinWakewordAlreadyShown || !ONBOARDING_WAKEWORD_VIEW) ? (
        <OptinTechData setCollectTechData={setCollectTechData} />
      ) : null}
      {!optinViewAlreadyShown &&
      optinTechDataAlreadyShown &&
      (optinWakewordAlreadyShown || !ONBOARDING_WAKEWORD_VIEW) ? (
        <OptinVoiceTranscripts
          setOptinValue={setOptinValue}
          setOptinViewShown={setOptinViewShown}
          askForAudio={askForAudio}
          wakewordActive={wakewordActive}
        />
      ) : null}
      {optinViewAlreadyShown && permissionError ? (
        <PermissionError permissionError={permissionError} />
      ) : null}
      {optinViewAlreadyShown && !permissionError ? (
        <React.Fragment>
          <OnboardingPageContent wakewordActive={wakewordActive} />
          <Footer />
        </React.Fragment>
      ) : null}
    </div>
  );
};

const OptinWakeword = ({ setWakewordOptinValue }) => {
  const updateWakewordSetting = event => {
    event.preventDefault();
    setWakewordOptinValue(!!event.target.value);
  };
  return (
    <div id="optinWakeword" className="modal-wrapper">
      <div className="modal">
        <div className="modal-header">
          <p className="success">Successfully Installed</p>
          <h1>A hands free experience</h1>
        </div>
        <div className="modal-content">
          <p>
            Firefox Voice can listen for "Hey Firefox" to trigger the microphone
            creating a 100% hands gree experience.
          </p>
        </div>
        <div className="modal-footer">
          <button
            className="styled-button"
            onClick={updateWakewordSetting}
            value={true}
          >
            Yes, listen for "Hey Firefox"
          </button>
          <button
            className="styled-button cancel-button"
            onClick={updateWakewordSetting}
          >
            I'll click the mic icon to activate
          </button>
        </div>
      </div>
    </div>
  );
};

const OptinTechData = ({ setCollectTechData }) => {
  const updateTechData = event => {
    event.preventDefault();
    setCollectTechData(!!event.target.value);
  };
  return (
    <div id="optinTechData" className="modal-wrapper">
      <div className="modal">
        <div className="modal-header">
          <h1>
            Allow Firefox Voice to send technical and interaction data to
            Mozilla?
          </h1>
        </div>
        <div className="modal-content">
          <p>
            This includes high-level categorizations of requests (e.g., search,
            close tab, and play music) and error reports. Changes to this
            setting can be made any time in preferences.
          </p>
          <p className="warning">
            Data is stored securely and without personally identifying
            information.
          </p>
        </div>
        <div className="modal-footer">
          <button
            className="styled-button"
            onClick={updateTechData}
            value={true}
          >
            Allow
          </button>
          <button
            className="styled-button cancel-button"
            onClick={updateTechData}
          >
            Don't allow
          </button>
        </div>
      </div>
    </div>
  );
};

const OptinVoiceTranscripts = ({
  setOptinValue,
  setOptinViewShown,
  askForAudio,
  wakewordActive,
}) => {
  const updateVoiceTranscriptOptin = event => {
    event.preventDefault();
    setOptinValue(!!event.target.value);
    setOptinViewShown(true);
  };

  return (
    <div id="optinVoiceTranscripts" className="modal-wrapper">
      <div className="modal">
        <div className="modal-header">
          {askForAudio ? (
            <h1>Allow Firefox Voice to collect Voice Samples</h1>
          ) : (
            <h1>Allow Firefox Voice to Collect Voice Transcripts</h1>
          )}
        </div>
        {askForAudio ? (
          <OptinAudioDescription wakewordActive={wakewordActive} />
        ) : (
          <OptinVoiceTranscriptsDescription wakewordActive={wakewordActive} />
        )}
        <div className="modal-footer">
          <button
            className="styled-button"
            onClick={updateVoiceTranscriptOptin}
            value={true}
          >
            Allow
          </button>
          <button
            className="styled-button cancel-button"
            onClick={updateVoiceTranscriptOptin}
          >
            Don't allow
          </button>
        </div>
      </div>
    </div>
  );
};

const OptinAudioDescription = ({ wakewordActive }) => {
  return (
    <div className="modal-content">
      <p>
        For research purposes and in order to improve Firefox Voice and related
        services, Mozilla would like to store a transcript of your voice
        recordings. We store this data securely and without personally
        identifying information.
      </p>
      <p>
        Can Firefox Voice store your voice recordings and associated transcript?
        You’ll always be able to use Firefox Voice, even if you don’t allow
        collection.
      </p>
      <p className="warning">
        {wakewordActive
          ? "Using “Hey Firefox” the microphone is active but audio will not be collected or sent to a server until after you say “Hey Firefox” or activate using a button press or keyboard shortcut."
          : "The microphone is only active when triggered with a button press or keyboard shortcut."}
      </p>
      <p>
        <a
          href="/views/privacy-policy.html"
          target="_blank"
          onClick={browserUtil.activateTabClickHandler}
        >
          Learn more about how Mozilla uses and processes voice data.
        </a>
      </p>
    </div>
  );
};

const OptinVoiceTranscriptsDescription = ({ wakewordActive }) => {
  return (
    <div className="modal-content">
      <p>
        For research purposes and in order to improve Firefox Voice and related
        services, Mozilla would like to store a transcript of your voice
        recordings. We store this data securely and without personally
        identifying information.
      </p>
      <p>
        Can Firefox Voice store transcripts of your voice recordings? You’ll
        always be able to use Firefox Voice, even if you don’t allow collection.
      </p>
      <p className="warning">
        {wakewordActive
          ? "Using “Hey Firefox” the microphone is active but audio will not be collected or sent to a server until after you say “Hey Firefox” or activate using a button press or keyboard shortcut."
          : "The microphone is only active when triggered with a button press or keyboard shortcut."}
      </p>
      <p>
        <a
          href="/views/privacy-policy.html"
          target="_blank"
          onClick={browserUtil.activateTabClickHandler}
        >
          Learn more about how Mozilla uses and processes voice data.
        </a>
      </p>
    </div>
  );
};

const OnboardingPageContent = ({ wakewordActive }) => {
  return (
    <div id="onboarding-content">
      {!wakewordActive ? (
        <div id="toolbar-arrow-wrapper">
          <div id="toolbar-arrow"></div>
        </div>
      ) : null}
      <div id="onboarding-logo">
        <img
          src="/assets/images/firefox-voice-logo.svg"
          alt="Firefox Voice Logo"
        />
      </div>
      <div>
        {wakewordActive ? (
          <WakewordGetStartedSection />
        ) : (
          <div>
            <GetStartedSection />
            <TryItSection />
          </div>
        )}
      </div>
    </div>
  );
};

const WakewordGetStartedSection = () => {
  return (
    <div className="onboarding-section try-it mic-icon">
      <h1>Say "Hey Firefox" to get started</h1>
      <p>Ask things like</p>
      <br></br>
      <ul>
        <li>Go to New York Times</li>
        <li>Read the article on this page</li>
        <li>Show movie times at the closest theater</li>
        <li>Find my calendar tab</li>
        <li>Shop for dog beds on Amazon</li>
      </ul>
    </div>
  );
};

const GetStartedSection = () => {
  const keyboardShortcut =
    navigator.platform === "MacIntel" ? "Command ⌘" : "Ctrl";
  return (
    <div id="get-started" className="onboarding-section mic-icon">
      <h1>Get Started</h1>
      <p>Click the mic in the toolbar above.</p>
      <p>Or, try the keyboard shortcut.</p>
      <p id="keyboard-shortcut">
        <span id="device-shortcut">{keyboardShortcut}</span>+<span>.</span>
      </p>
    </div>
  );
};

const TryItSection = () => {
  return (
    <div className="onboarding-section try-it superhero-icon">
      <h1>Try Your New Super Power</h1>
      <p>Say things like</p>
      <ul>
        <li>Go to New York Times</li>
        <li>Read the article on this page</li>
        <li>Show movie times at the closest theater</li>
        <li>Find my calendar tab</li>
        <li>Shop for dog beds on Amazon</li>
      </ul>
    </div>
  );
};

const PermissionError = ({ permissionError }) => {
  if (!permissionError) {
    return null;
  }

  const errorView = permissionError => {
    if (permissionError === "Waiting") {
      return (
        <>
          <h1 className="waiting">Waiting for Microphone Permissions</h1>
          <p>
            Firefox Voice needs permission to access the microphone in order to
            hear your requests
          </p>
        </>
      );
    } else if (permissionError === "NotAllowedError") {
      return (
        <>
          <h1>Can't Access Microphone</h1>
          <p>
            Firefox Voice needs permission to access the microphone in order to
            hear your requests.
          </p>
          <AllowMicrophoneInstructions />
        </>
      );
    } else if (permissionError === "NotFoundError") {
      return (
        <>
          <h1>Microphone Not Found</h1>
          <p>
            Confirm your microphone is on, plugged in, and it works in other
            applications.
          </p>
          <AllowMicrophoneInstructions />
        </>
      );
    }

    return (
      <>
        <h1>Can't Access Microphone</h1>
        <p>{String(permissionError) || "Unknown error"}</p>
      </>
    );
  };

  return (
    <div className="modal-wrapper">
      <div className="modal error-modal">
        <div className="modal-content">{errorView(permissionError)}</div>
      </div>
    </div>
  );
};

const AllowMicrophoneInstructions = () => {
  const reloadPage = () => {
    window.location.reload(false);
  };

  return (
    <div id="must-allow">
      <p>
        First click on
        <img
          alt="Example: Extension (Firefox Voice)"
          src="./images/security-button.png"
          className="security-button"
        />
        in the URL bar.
      </p>

      <p>Next remove the permission denial:</p>

      <img
        alt="Example: Permissions: use the microphone"
        src="./images/security-panel.png"
        className="security-panel"
      />

      <p>After that</p>

      <button className="styled-button" onClick={reloadPage}>
        Reload the page
      </button>
    </div>
  );
};

const Footer = () => {
  return (
    <div id="footer">
      <ul>
        <li>
          <a
            href="https://github.com/mozilla/firefox-voice"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
        </li>
        <li>
          <a
            href="https://firefox-voice-feedback.herokuapp.com/"
            target="_blank"
          >
            Feedback
          </a>
        </li>
        <li>
          <a
            href="/views/privacy-policy.html"
            target="_blank"
            rel="noopener"
            onClick={browserUtil.activateTabClickHandler}
          >
            Privacy Policy
          </a>
        </li>
        <li>
          <a
            href="/views/lexicon.html"
            target="_blank"
            onClick={browserUtil.activateTabClickHandler}
          >
            Things you can say
          </a>
        </li>
      </ul>
      <p>
        Visit Mozilla Corporation’s not-for-profit parent, the{" "}
        <a href="https://foundation.mozilla.org/en/" target="_blank">
          Mozilla Foundation
        </a>
        .
      </p>
    </div>
  );
};
