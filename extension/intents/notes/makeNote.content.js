import { registerHandler } from "../../background/communicate.js";

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

function getEditableElement(element) {
  if (element === null) {
    return null;
  }
  if (element.isContentEditable === true) {
    return element;
  }
  return getEditableElement(element.parentNode);
}

registerHandler("setPlace", async message => {
  const el = document.activeElement;
  const nodeName = el.nodeName.toLowerCase();
  // https://stackoverflow.com/questions/26723648/check-whether-an-html-element-is-editable-or-not-using-js?fbclid=IwAR3ifBPUuRlq831rI1mzPE-QTX2602-zCMj6SEQU7EwmoD0bpwOE0052bjU
  if (
    el.nodeType === 1 &&
    (nodeName === "textarea" ||
      (nodeName === "input" &&
        /^(?:text|email|number|search|tel|url|password)$/i.test(el.type)))
  ) {
    focusElement = el;
    return null;
  }
  const editableElement = getEditableElement(el);
  if (editableElement === null) {
    return "Firefox Voice doesn't know how to write to this document";
  }
  focusElement = editableElement;
  return null;
});

registerHandler("addLink", async message => {
  let linkText = `[${message.metadata.title}](${message.metadata.url})`;
  const value = focusElement.value;
  if (value && !/ \n$/.test(value)) {
    linkText = "\n" + linkText;
  }
  focus();
  await paste(linkText);
  return true;
});

registerHandler("pasteText", async message => {
  focus();
  document.execCommand("paste");
  return true;
});

registerHandler("addText", async message => {
  let text = message.text;
  const value = focusElement.value;
  if (value && !/ \n$/.test(value)) {
    text = "\n" + text;
  }
  focus();
  await paste(text);
  return true;
});
