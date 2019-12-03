/* globals React, ReactDOM */

this.onboardingController = (function() {
    const exports = {};
    const {
        useState,
        useEffect
    } = React;
    const onboardingContainer = document.getElementById("onboarding-container");
    let isInitialized = false;

    exports.OnboardingController = function() {
        const [optinViewAlreadyShown, setOptinViewShown] = useState(false);
        const [permissionError, setPermissionError] = useState(null);

        useEffect(() => {
            if (!isInitialized) {
                isInitialized = true;
                init();
            }
        });

        const init = () => {
            if (location.pathname.endsWith("onboard.html")) {
                launchPermission();
            }
        };

        const setOptinValue = async (value) => {
            // TODO: update the optin value here
        };

        const launchPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Set hotkey suggestion based on navigator
                // document.querySelector("#action-key").textContent =
                //     navigator.platform === "MacIntel" ? "Command ⌘" : "Ctrl";
                const tracks = stream.getTracks();
                for (const track of tracks) {
                    track.stop();
                }
            } catch (e) {
                if (e.name === "NotAllowedError") {
                    setPermissionError("NotAllowedError");
                } else {
                    setPermissionError("UnknownError");
                }
            }
        };

        return (
            <onboardingView.Onboarding
                optinViewAlreadyShown={optinViewAlreadyShown}
                setOptinValue={setOptinValue}
                setOptinViewShown={setOptinViewShown}
                permissionError={permissionError}
            />
        );
    };

    ReactDOM.render(<exports.OnboardingController />, onboardingContainer);

    return exports;
})();
