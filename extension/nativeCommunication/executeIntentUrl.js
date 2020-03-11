this.executeIntentUrl = (function() {
  async function execute() {
    const url = new URL(location.href);
    const text = url.searchParams.get("text");
    await browser.runtime.sendMessage({
      type: "runIntent",
      text,
      noPopup: true,
      closeThisTab: true,
    });
  }

  execute();
})();
