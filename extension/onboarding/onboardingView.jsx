/* eslint-disable no-unused-vars */

this.onboardingView = (function() {
    const exports = {};

    exports.Onboarding = ({
        optinViewAlreadyShown,
        setOptinValue,
        setOptinViewShown,
        permissionError
    }) => {
        return (
            <div id="onboarding-wrapper">
                <OnboardingPageContent />
                <OptinVoiceTranscripts
                    optinViewAlreadyShown={optinViewAlreadyShown}
                    setOptinValue={setOptinValue}
                    setOptinViewShown={setOptinViewShown} />
                <PermissionError permissionError={permissionError} />
            </div>
        );
    };

    const OptinVoiceTranscripts = ({ optinViewAlreadyShown, setOptinValue, setOptinViewShown}) => {
        const updateVoiceTranscriptOptin = (event) => {
            event.preventDefault();
            setOptinValue(!!event.target.value);
            setOptinViewShown(true);
        };

        if (optinViewAlreadyShown) return null;
        return (
            <div id="optinVoiceTranscripts" className="modal-wrapper">
                <div className="modal">
                    <h1>Allow Firefox Voice to Collect Voice Transcripts</h1>
                    <p>
                        For research purposes and in order to improve Firefox Voice and related services, Mozilla would like to collect and analyze voice transcripts. We store this data securely and without personally identifying information. Can Firefox Voice store transcripts of your voice recordings for research?
                    </p>
                    <p>
                        You’ll always be able to use Firefox Voice, even if you don’t allow collection. The microphone is only active when triggered with a button press or keyboard shortcut.
                    </p>
                    <p>
                        <a href="#">Learn how Mozilla protects your voice data.</a>
                    </p>
                    <button
                        className="styled-button"
                        onClick={updateVoiceTranscriptOptin}
                        value={true}
                    >
                        Allow
                    </button>
                    <a href="#" onClick={updateVoiceTranscriptOptin}>Don't Allow</a>
                </div>
            </div>
        );
    };

    const OnboardingPageContent = () => {
        return (
            <div id="onboarding-content">
                <div id="onboarding-logo">
                    <img src="./images/firefox-voice-logo.svg" alt="Firefox Voice Logo" />
                </div>
                <div>
                    <GetStartedSection />
                    <TryItSection />
                </div>
            </div>
        );
    };

    const GetStartedSection = () => {
        return (
            <div id="get-started" className="onboarding-section">
                <h1 className="section-header">Get Started</h1>
                <p>Click the mic in the toolbar above. 
                    Or, try the keyboard shortcut.</p>
            </div>
        );
    };

    const TryItSection = () => {
        return (
            <div id="try-it" className="onboarding-section">
                <h1 className="section-header">Try Your New Super Power</h1>
                <p>Say things like:</p>
            </div>
        );
    };

    const PermissionError = ({permissionError}) => {
        if (!permissionError) {
            return null;
        }
        return (
            <div className="modal-wrapper">
                <div className="modal error-modal">
                    permissionError === "NotAllowedError"
                    ? <div className="modal-content">
                        <h1>Waiting for Microphone Permissions</h1>
                        <p>Firefox Voice needs permission to access the microphone in order to hear your requests</p>
                        <EnableMicrophoneButton />
                    </div>
                    : <div className="modal-content">
                        <h1>Can't Access Microphone</h1>
                        <p>{String(permissionError) || "Unknown error"}</p>
                        <EnableMicrophoneButton />
                    </div>
                </div>
            </div>
        );
    };

    const EnableMicrophoneButton = ({genericError}) => {
        return (
            <button className="styled-button light-blue">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                >
                    <path
                        fill="context-fill"
                        d="M15 7h-2.1a4.967 4.967 0 0 0-.732-1.753l1.49-1.49a1 1 0 0 0-1.414-1.414l-1.49 1.49A4.968 4.968 0 0 0 9 3.1V1a1 1 0 0 0-2 0v2.1a4.968 4.968 0 0 0-1.753.732l-1.49-1.49a1 1 0 0 0-1.414 1.415l1.49 1.49A4.967 4.967 0 0 0 3.1 7H1a1 1 0 0 0 0 2h2.1a4.968 4.968 0 0 0 .737 1.763c-.014.013-.032.017-.045.03l-1.45 1.45a1 1 0 1 0 1.414 1.414l1.45-1.45c.013-.013.018-.031.03-.045A4.968 4.968 0 0 0 7 12.9V15a1 1 0 0 0 2 0v-2.1a4.968 4.968 0 0 0 1.753-.732l1.49 1.49a1 1 0 0 0 1.414-1.414l-1.49-1.49A4.967 4.967 0 0 0 12.9 9H15a1 1 0 0 0 0-2zM5 8a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"
                    ></path>
                </svg>
                Enable Microphone
            </button>
        );
    };

    return exports;
})();
