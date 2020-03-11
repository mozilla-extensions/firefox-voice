/* globals communicate */

this.contentScript = (function() {
  let focusElement;

  function focus() {
    if (document.activeElement !== focusElement) {
      focusElement.focus();
    }
  }

  async function paste(text) {
    let old;
    if (navigator.clipboard.read) {
      old = await navigator.clipboard.read();
    }
    await navigator.clipboard.writeText(text);
    document.execCommand("paste");
    if (old !== undefined) {
      await navigator.clipboard.writeText(old);
    }
  }

  communicate.register("setPlace", async message => {
    const el = document.activeElement;
    /*
    if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") {
      return "Firefox Voice doesn't know how to write to this document";
    }
    */
    focusElement = el;
    return null;
  });

  communicate.register("addLink", async message => {
    let linkText = `[${message.metadata.title}](${message.metadata.url})`;
    const value = focusElement.value;
    if (value && !/ \n$/.test(value)) {
      linkText = "\n" + linkText;
    }
    focus();
    await paste(linkText);
    return true;
  });

  communicate.register("pasteText", async message => {
    focus();
    document.execCommand("paste");
    return true;
  });

  communicate.register("addText", async message => {
    let text = message.text;
    const value = focusElement.value;
    if (value && !/ \n$/.test(value)) {
      text = "\n" + text;
    }
    focus();
    await paste(text);
    return true;
  });
})();
