import * as intentRunner from "../../background/intentRunner.js";
import * as pageMetadata from "../../background/pageMetadata.js";

intentRunner.registerIntent({
  name: "speech.readTitle",
  async run(context) {
    const activeTab = await context.activeTab();
    const metadata = await pageMetadata.getMetadata(activeTab.id);
    const synth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance(metadata.title);
    utterThis.lang = "en-US";
    synth.speak(utterThis);
  },
});
