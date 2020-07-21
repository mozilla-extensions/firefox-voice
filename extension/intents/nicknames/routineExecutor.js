/* globals log */

import * as intentRunner from "../../background/intentRunner.js";

export let pausedRoutineExecutor = null;
export class RoutineExecutor {
  constructor(
    routineName,
    subcommands,
    programCounter = 0,
    states = null,
    startLoopProgramCounter = 0
  ) {
    this.routineName = routineName;
    this.subcommands = subcommands;
    this.programCounter = programCounter;
    this.states = states;
    this.startLoopProgramCounter = startLoopProgramCounter;
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
    for (
      ;
      this.programCounter < this.subcommands.length;
      this.programCounter++
    ) {
      const subcommand = this.subcommands[this.programCounter];
      const stopRoutine = await this.runSubcommand(subcommand);
      if (stopRoutine === true) {
        return true;
      }
    }
    if (this.states !== null) {
      const exc = new Error("'End for' is required at the end of loop.");
      exc.displayMessage = "'End for' is required at the end of loop.";
      throw exc;
    }
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
}
