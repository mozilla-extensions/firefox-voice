/* globals onboarding, util */

this.popup = (function() {

  const PERMISSION_REQUEST_TIME = 500;
  const FAST_PERMISSION_CLOSE = 500;
  let stream;
  let isWaitingForPermission = null;

  async function init() {
    document.addEventListener("beforeunload", () => {
      if (isWaitingForPermission && Date.now() - isWaitingForPermission < FAST_PERMISSION_CLOSE) {
        onboarding.startOnboarding();
      }
    });
    try {
      isWaitingForPermission = Date.now();
      await startMicrophone();
      isWaitingForPermission = null;
    } catch (e) {
      isWaitingForPermission = false;
      if (e.name === "NotAllowedError" || e.name === "TimeoutError") {
        onboarding.startOnboarding();
        window.close();
        return;
      }
      throw e;
    }
    document.querySelector("#content").textContent = `I got it! ${stream}`;
  }

  async function requestMicrophone() {
    stream = await navigator.mediaDevices.getUserMedia({audio: true});
    return stream;
  }

  async function startMicrophone() {
    const sleeper = util.sleep(PERMISSION_REQUEST_TIME).then(() => {
      const exc = new Error("Permission Timed Out");
      exc.name = "TimeoutError";
      throw exc;
    });
    await Promise.race([requestMicrophone(), sleeper]);
  }

  init();

})();
