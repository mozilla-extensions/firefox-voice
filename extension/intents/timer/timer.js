/* globals catcher */

import * as intentRunner from "../../background/intentRunner.js";
import * as util from "../../util.js";

class Timer {
  async doAction(action) {
    if (action.type === "setTimer") {
      this.totalInSeconds = action.totalInSeconds;
      return this.start(action.totalInSeconds);
    } else if (action.type === "closeTimer") {
      this.close();
      return true;
    } else if (action.type === "getTimer") {
      return {
        startTimestamp: this.startTimestamp,
        totalInSeconds: this.totalInSeconds,
        paused: this.paused,
        remainingInSeconds: this.remainingInSeconds,
      };
    }
    return null;
  }

  isSet() {
    return this.startTimestamp !== undefined;
  }

  isPaused() {
    return this.paused === true;
  }

  close() {
    this.startTimestamp = undefined;
    this.totalInSeconds = undefined;
    this.remainingInSeconds = undefined;
    if (this.sleeperWithClear !== undefined) this.sleeperWithClear.clear();
  }

  pause() {
    this.paused = true;
    this.remainingInSeconds = this.calculateRemainingMs() / 1000;
    if (this.sleeperWithClear !== undefined) this.sleeperWithClear.clear();
  }

  async unpause() {
    this.paused = false;
    return this.start(this.remainingInSeconds);
  }

  calculateRemainingMs() {
    return (
      this.totalInSeconds * 1000 - (new Date().getTime() - this.startTimestamp)
    );
  }

  reset() {
    if (this.sleeperWithClear !== undefined) this.sleeperWithClear.clear();

    return this.start(this.totalInSeconds);
  }

  async start(inSeconds) {
    this.startTimestamp = new Date().getTime();
    this.remainingInSeconds = inSeconds;

    const waitFor = inSeconds * 1000;
    this.sleeperWithClear = util.getSleeperWithClear(waitFor);
    await this.sleeperWithClear.sleeper;

    // send message to popup and open it if no response;
    // do not close timeout now; make popup do it
    try {
      const result = await browser.runtime.sendMessage({
        type: "closeTimer",
        totalInSeconds: this.totalInSeconds, // piggyback
      });
      if (result) {
        return null;
      }
    } catch (e) {
      catcher.capture(e);
    }

    return browser.experiments.voice.openPopup();
  }
}

export const timer = new Timer();

intentRunner.registerIntent({
  name: "timer.set",
  async run(context) {
    let seconds = 0;
    const set = timer.isSet();
    if (set === true) {
      const e = new Error("Failed to set timer");
      e.displayMessage = "Only one timer can be active.";
      throw e;
    }

    context.keepPopup();

    if (context.slots.seconds !== undefined) {
      seconds = parseInt(context.slots.seconds, 10);
    }
    if (context.slots.minutes !== undefined) {
      seconds += parseInt(context.slots.minutes, 10) * 60;
    }
    if (context.slots.hours !== undefined) {
      seconds += parseInt(context.slots.hours, 10) * 60 * 60;
    }

    // 'Set timer for 0 seconds' does nothing
    if (seconds === 0) {
      return;
    }

    if (Number.isNaN(seconds)) {
      throw new Error(`Cannot understand number: ${seconds}`);
    }

    timer.doAction({
      type: "setTimer",
      totalInSeconds: seconds,
    });

    await browser.runtime.sendMessage({
      type: "setTimer",
      timerInSeconds: seconds,
    });
  },
});

intentRunner.registerIntent({
  name: "timer.close",
  async run() {
    const set = timer.isSet();
    if (set === false) {
      const e = new Error("Failed to close timer");
      e.displayMessage = "No timer is set.";
      throw e;
    }
    timer.close();
  },
});

intentRunner.registerIntent({
  name: "timer.reset",
  async run() {
    const set = timer.isSet();
    if (set === false) {
      const e = new Error("Failed to reset timer");
      e.displayMessage = "No timer is set.";
      throw e;
    }
    timer.reset();
  },
});

intentRunner.registerIntent({
  name: "timer.pause",
  async run() {
    const set = timer.isSet();
    if (set === false) {
      const e = new Error("Failed to pause timer");
      e.displayMessage = "No timer is set.";
      throw e;
    }
    timer.pause();
  },
});

intentRunner.registerIntent({
  name: "timer.unpause",
  async run() {
    const set = timer.isSet();
    const paused = timer.isPaused();
    if (set === false || paused === false) {
      const e = new Error("Failed to unpause timer");
      e.displayMessage = "No active timer.";
      throw e;
    }
    timer.unpause();
  },
});
