import * as intentRunner from "../../background/intentRunner.js";


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

    await browser.runtime.sendMessage({
        type: "timer",
        timerInSeconds: seconds
    });
  },
});
