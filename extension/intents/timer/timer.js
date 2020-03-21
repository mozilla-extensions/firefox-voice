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
        remaining: this.remaining
      };
    }
    return null;
  }

  close() {
    this.startTimestamp = undefined;
    this.totalInSeconds = undefined;
    if (this.sleeperWithClear !== undefined)
      this.sleeperWithClear.clear();
  }

  pause() {
    this.paused = true;
    this.remaining = this.calculateRemainingMs() / 1000;
    if (this.sleeperWithClear !== undefined)
      this.sleeperWithClear.clear();
  }

  async unpause() {
    this.paused = false;
    return this.start(this.remaining);
  }

  calculateRemainingMs() {
    return this.totalInSeconds * 1000 -
            (new Date().getTime() - this.startTimestamp);
  }

  reset() {
    if (this.sleeperWithClear !== undefined)
      this.sleeperWithClear.clear();

    return this.start(this.totalInSeconds);
  }

  async start(inSeconds) {
    this.startTimestamp = new Date().getTime();
    this.remaining = inSeconds;

    const waitFor = inSeconds * 1000;
    this.sleeperWithClear = util.getSleeperWithClear(waitFor);
    await this.sleeperWithClear.sleeper;

    try {
      const result = await browser.runtime.sendMessage({
        type: "closeTimer",
        timerObject: { // piggyback
          startTimestamp: this.startTimestamp,
          totalInSeconds: this.totalInSeconds
        }
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
    context.keepPopup();

    let seconds = 0;
    if (context.slots.seconds !== undefined) {
      seconds = parseInt(context.slots.seconds);
    }
    if (context.slots.minutes !== undefined) {
        seconds += parseInt(context.slots.minutes) * 60;
    }
    if (context.slots.hours !== undefined) {
      seconds += parseInt(context.slots.hours) * 60 * 60;
    }
    if (seconds === 0) {
        console.log("EROARE");
    }

    timer.doAction({
      type: "setTimer",
      totalInSeconds: seconds
    });

    await browser.runtime.sendMessage({
        type: "setTimer",
        timerInSeconds: seconds
    });
  },
});

intentRunner.registerIntent({
  name: "timer.close",
  async run(context) {
    timer.close();
    await context.done();
  },
});


intentRunner.registerIntent({
  name: "timer.reset",
  async run(context) {
    timer.reset();
    await context.done();
  },
});


intentRunner.registerIntent({
  name: "timer.pause",
  async run(context) {
    timer.pause();
  },
});

intentRunner.registerIntent({
  name: "timer.unpause",
  async run(context) {
    timer.unpause();
  },
});
