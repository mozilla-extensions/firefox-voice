import * as intentRunner from "../../background/intentRunner.js";

intentRunner.registerIntent({
  name: "print.print",
  description: "print the current tab",
  examples: ["print tab"],
  match: `
  print (this | the |) (current |) (tab | page |)
  `,
  async run(context) {
    await browser.tabs.print();
  },
});
