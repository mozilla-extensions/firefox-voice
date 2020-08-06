/* globals catcher, chrono */

import * as intentRunner from "../../background/intentRunner.js";
import { registerHandler, sendMessage } from "../../communicate.js";

class TimerController {
  constructor() {
    this.activeTimer = null;
    this.lastActiveTimer = null;
  }

  getActiveTimer() {
    return this.activeTimer;
  }

  closeActiveTimer() {
    this.activeTimer.close();
    this.activeTimer = null;
  }

  setActiveTimer(totalInMS, context) {
    this.activeTimer = new Timer(totalInMS, context);
    this.lastActiveTimer = { ...this.activeTimer };
    this.activeTimer.start();
  }

  restoreTimer(context) {
    this.setActiveTimer(this.lastActiveTimer.totalInMS, context);
    return this.activeTimer;
  }
}

class Timer {
  constructor(totalInMS, context) {
    this.totalInMS = totalInMS;
    this.startTimestamp = undefined;
    this.remainingInMS = undefined;
    this.paused = undefined;
    this.context = context;
  }

  close() {
    this.startTimestamp = undefined;
    this.totalInMS = undefined;
    this.remainingInMS = undefined;

    if (this.timeoutId !== undefined) {
      this.context.endFollowup();
      clearTimeout(this.timeoutId);
    }
  }

  pause() {
    this.paused = true;
    this.remainingInMS = this.remainingMs();
    if (this.timeoutId !== undefined) clearTimeout(this.timeoutId);
  }

  async unpause() {
    this.paused = false;
    return this.start(this.remainingInMS);
  }

  remainingMs() {
    return this.totalInMS - (new Date().getTime() - this.startTimestamp);
  }

  reset() {
    if (this.timeoutId !== undefined) clearTimeout(this.timeoutId);

    return this.start(this.totalInMS);
  }

  async start(duration = this.totalInMS) {
    this.startTimestamp = new Date().getTime();
    this.remainingInMS = duration;

    this.timeoutId = setTimeout(() => this.openPopup(), duration);
  }

  async openPopup() {
    this.timeoutId = undefined;
    // timer may be triggered after other intents have run;
    // set last intent in order to allow for timer followup;
    intentRunner.setLastIntent(this.context);
    const followup = {
      heading: "Say 'reset' or 'reset timer'",
    };

    // send message to popup and open it if no response;
    // do not close timeout now; make popup do it
    try {
      const result = await sendMessage({
        type: "closeTimer",
        totalInMS: this.totalInMS, // piggyback
        followup: { heading: "Say 'reset' or 'reset timer'" },
      });
      if (result) {
        return;
      }
    } catch (e) {
      catcher.capture(e);
    }

    await browser.experiments.voice.openPopup();
    setTimeout(() => {
      this.context.startFollowup({
        ...followup,
      });
    }, 1000);
  }
}

export const timerController = new TimerController();

async function executeAfterTimerIsSet(context) {
  context.startFollowup({
    heading: "Say 'close timer' or 'reset'",
    acceptFollowupIntent: ["timer.close"],
    skipSuccessView: true,
  });
  await sendMessage({
    type: "setTimer",
    timerInMS: timerController.getActiveTimer().totalInMS,
  });
}

intentRunner.registerIntent({
  name: "timer.set",
  async run(context) {
    const activeTimer = timerController.getActiveTimer();
    if (activeTimer !== null) {
      const e = new Error("Failed to set timer");
      e.displayMessage = "Only one timer can be active.";
      throw e;
    }
    if (context.parameters.suffixTime !== undefined) {
      context.slots.time =
        context.slots.time + " " + context.parameters.suffixTime;
    }
    context.keepPopup();
    const result = chrono.parse(context.slots.time);

    if (result === null || result.length === 0) {
      const e = new Error("Failed to set timer");
      e.displayMessage = `Cannot set timer for ${context.slots.time}`;
      throw e;
    }

    let ms = 0;
    for (let i = 0; i < result.length; i++) {
      const startTime = result[i].ref;
      const endTime = result[i].start.date();
      // skip if timer is set for 0 seconds
      const time = parseInt(result[i].text);
      if (time === 0) {
        continue;
      }
      // round up to actual number of seconds
      ms += Math.ceil((endTime - startTime) / 1000.0) * 1000;
    }

    if (ms === 0) {
      const e = new Error("Failed to set timer");
      e.displayMessage = "Cannot set timer for 0 seconds";
      throw e;
    }
    timerController.setActiveTimer(ms, context);

    await executeAfterTimerIsSet(context);
  },
  async runFollowup(context) {
    let activeTimer = timerController.getActiveTimer();
    if (activeTimer === null) {
      activeTimer = timerController.restoreTimer(context);
    }

    activeTimer.reset();
    await executeAfterTimerIsSet(context);
  },
});

intentRunner.registerIntent({
  name: "timer.close",
  async run() {
    const activeTimer = timerController.getActiveTimer();
    if (activeTimer === null) {
      const e = new Error("Failed to close timer");
      e.displayMessage = "No timer is set.";
      throw e;
    }
    timerController.closeActiveTimer();
  },
});

intentRunner.registerIntent({
  name: "timer.reset",
  async run() {
    const activeTimer = timerController.getActiveTimer();
    if (activeTimer === null) {
      const e = new Error("Failed to reset timer");
      e.displayMessage = "No timer is set.";
      throw e;
    }
    activeTimer.reset();
  },
});

intentRunner.registerIntent({
  name: "timer.pause",
  async run() {
    const activeTimer = timerController.getActiveTimer();
    if (activeTimer === null) {
      const e = new Error("Failed to pause timer");
      e.displayMessage = "No timer is set.";
      throw e;
    }
    activeTimer.pause();
  },
});

intentRunner.registerIntent({
  name: "timer.unpause",
  async run() {
    const activeTimer = timerController.getActiveTimer();
    if (activeTimer === null || activeTimer.paused === false) {
      const e = new Error("Failed to unpause timer");
      e.displayMessage = "No active timer.";
      throw e;
    }
    activeTimer.unpause();
  },
});

registerHandler("timerAction", message => {
  return timerController[message.method](...(message.args || []));
});
