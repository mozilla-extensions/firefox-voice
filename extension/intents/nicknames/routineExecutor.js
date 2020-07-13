/* globals log */

import * as intentRunner from "../../background/intentRunner.js";

export class RoutineExecutor {
  constructor(
    routineName,
    subcommands,
    index = 0,
    states = [{}],
    forIndex = 0
  ) {
    this.routineName = routineName;
    this.subcommands = subcommands;
    this.index = index;
    this.states = states;
    this.forIndex = forIndex;
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

    log.info(
      "  Running subintent",
      subcommand,
      subcommand.name,
      subcommand.slots,
      this.index
    );

    subcommand = this.mapState(subcommand, this.states[0]);
    subcommand.routineExecutor = this;
    subcommand.onError = message => {
      hadError = true;
      errorMessage = message;
    };
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
    this.states = states;
    this.forIndex = this.index;
  }

  endLoop() {
    this.states.shift();
    if (this.states.length > 0) {
      this.index = this.forIndex;
    } else {
      this.states = [{}];
    }
  }

  async run() {
    const { pausedRoutine } = await browser.storage.local.get("pausedRoutine");
    if (pausedRoutine !== undefined) {
      const exc = new Error("Another routine is already active.");
      exc.displayMessage = "Another routine is already active.";
      throw exc;
    }

    for (; this.index < this.subcommands.length; this.index++) {
      const subcommand = this.subcommands[this.index];
      const stopRoutine = await this.runSubcommand(subcommand);
      if (stopRoutine === true) {
        break;
      }
    }
    return true;
  }

  pauseRoutine() {
    this._stop = true;
    browser.storage.local.set({
      pausedRoutine: {
        name: this.routineName,
        forIndex: this.forIndex,
        nextIndex: this.index + 1,
        states: this.states,
      },
    });
  }
}
