/* globals pageMetadata */

this.intentRunner.registerIntent({
  name: "speech.readTitle",
  description: "Read page title via speech synthesis",
  examples: ["read page title"],
  match: `
  read (page | tab |) (title | name)
  what is the (title | name) (of this page |)
`,
  async run(context) {
    const activeTab = await context.activeTab();
    const metadata = await pageMetadata.getMetadata(activeTab.id);
    const synth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance(metadata.title);
    utterThis.lang = "en-US";
    synth.speak(utterThis);
  },
});
