/* globals log */

import * as intentRunner from "../../background/intentRunner.js";

export class RoutineExecutor {
  constructor(routineName, subcommands, index = 0) {
    this.routineName = routineName;
    this.subcommands = subcommands;
    this.index = index;
  }

  async runSubcommand(subcommand) {
    let hadError = false;
    subcommand.onError = () => {
      hadError = true;
    };

    subcommand.parentRoutine = {
      name: this.routineName,
      nextIndex: this.index + 1,
      stop: false,
    };
    log.info(
      "  Running subintent",
      subcommand,
      subcommand.name,
      subcommand.slots
    );

    await intentRunner.runIntent(subcommand);
    if (hadError) {
      log.info("  Last intent failed, stopping");
      return true;
    }
    return subcommand.parentRoutine.stop === true;
  }

  async run() {
    for (; this.index < this.subcommands.length; this.index++) {
      const subcommand = this.subcommands[this.index];
      const stopRoutine = await this.runSubcommand(subcommand);
      if (stopRoutine === true) {
        break;
      }
    }
    return true;
  }
}
