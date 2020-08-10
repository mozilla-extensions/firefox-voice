/* globals log, catcher */

import * as intentRunner from "../../background/intentRunner.js";
import { sendMessage } from "../../communicate.js";

export let pausedRoutineExecutor = null;
export let currentRoutineExecutor = null;
export class RoutineExecutor {
  constructor(
    routineName,
    subcommands,
    programCounter = 0,
    states = null,
    startLoopProgramCounter = 0,
    stopRoutine = false
  ) {
    this.routineName = routineName;
    this.subcommands = subcommands;
    this.programCounter = programCounter;
    this.states = states;
    this.startLoopProgramCounter = startLoopProgramCounter;
    this.stopRoutine = stopRoutine;
  }

  mapState(subcommand, state) {
    const copySubcommand = JSON.parse(JSON.stringify(subcommand));
    for (const slot in subcommand.slots) {
      if (subcommand.slots[slot] in state) {
        copySubcommand.slots[slot] = state[subcommand.slots[slot]];
      }
    }
    return copySubcommand;
  }

  async runSubcommand(subcommand) {
    let hadError = false;
    let errorMessage = null;
    if (this.states !== null) {
      subcommand = this.mapState(subcommand, this.states[0]);
    } else {
      subcommand = JSON.parse(JSON.stringify(subcommand));
    }
    subcommand.routineExecutor = this;
    subcommand.onError = message => {
      hadError = true;
      errorMessage = message;
    };

    log.info(
      "  Running subintent",
      subcommand,
      subcommand.name,
      subcommand.slots,
      this.programCounter
    );
    await intentRunner.runIntent(subcommand);
    if (hadError) {
      log.info(
        `Routine ${this.routineName} encountered error ${errorMessage} while running ${subcommand.utterance}`
      );
      return true;
    }

    return this._stop === true;
  }

  startLoop(states) {
    if (this.states !== null) {
      const exc = new Error("Encountered nested loops. Not yet supported.");
      exc.displayMessage = "Encountered nested loops. Not yet supported.";
      throw exc;
    }
    this.states = states;
    this.startLoopProgramCounter = this.programCounter;
  }

  endLoop() {
    this.states.shift();
    if (this.states.length > 0) {
      this.programCounter = this.startLoopProgramCounter;
    } else {
      this.states = null;
    }
  }

  async run() {
    if (pausedRoutineExecutor !== null) {
      const exc = new Error("Another routine is already active.");
      exc.displayMessage = "Another routine is already active.";
      throw exc;
    }
    currentRoutineExecutor = this;
    for (
      ;
      this.programCounter < this.subcommands.length;
      this.programCounter++
    ) {
      if (this.stopRoutine === true) {
        return true;
      }
      const subcommand = this.subcommands[this.programCounter];
      const stopRoutine = await this.runSubcommand(subcommand);
      if (stopRoutine === true) {
        currentRoutineExecutor = null;
        return true;
      }
    }
    if (this.states !== null) {
      const exc = new Error("'End for' is required at the end of loop.");
      exc.displayMessage = "'End for' is required at the end of loop.";
      throw exc;
    }
    currentRoutineExecutor = null;
    return true;
  }

  async continue() {
    pausedRoutineExecutor = null;
    this.programCounter++;
    this._stop = false;
    return this.run();
  }

  pauseRoutine() {
    this._stop = true;
    pausedRoutineExecutor = this;
  }

  pauseRoutineForTime(ms, message) {
    this.pauseRoutine();
    setTimeout(async () => {
      try {
        const result = await sendMessage({
          type: "triggerPopupWithMessage",
          message: message || "Routine break finished.",
        });
        if (result) {
          this.continue();
        }
      } catch (e) {
        catcher.capture(e);
      }

      await browser.experiments.voice.openPopup();
      setTimeout(async () => {
        await sendMessage({
          type: "triggerPopupWithMessage",
          message: message || "Routine break finished.",
        });
      }, 1000);
      await this.continue();
    }, ms);
  }

  stop() {
    this.stopRoutine = true;
    pausedRoutineExecutor = null;
    currentRoutineExecutor = null;
  }
}
