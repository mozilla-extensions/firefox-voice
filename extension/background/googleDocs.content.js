import { registerHandler } from "../communicate.js";

const clickGoogleSelectionToLinkButton = () => {
  // simulates clicking on the "Turn selection into link" button. bubbles must be true so click event will trigger the appropriate event listener.
  const simulateMouseEvent = (element, eventName) => {
    element.dispatchEvent(
      new MouseEvent(eventName, {
        bubbles: true,
      })
    );
  };

  const insertLinkButton = document.getElementById("insertLinkButton");

  simulateMouseEvent(insertLinkButton, "mousedown");
  simulateMouseEvent(insertLinkButton, "mouseup");
  simulateMouseEvent(insertLinkButton, "click");
};

const getGoogleDocsSelectedText = () => {
  // this function is used to determine if the text selection (first rect) in the Google Doc overlaps with a given word (second rect)
  const areRectsOverlapping = (rectA, rectB) => {
    return (
      rectA.left <= rectB.right &&
      rectA.right >= rectB.left &&
      rectA.top <= rectB.bottom &&
      rectA.bottom >= rectB.top
    );
  };

  // removes \u200B (zero-width space), \u200C (zero-width non-joiner or &zwnj), and non-breaking spaces. Google Docs apparently inserts these characters into text for formatting purposes.
  const cleanDocumentText = text => {
    let cleanedText = text.replace(/[\u200B\u200C]/g, "");
    const nonBreakingSpaces = String.fromCharCode(160);
    const regex = new RegExp(nonBreakingSpaces, "g");
    cleanedText = cleanedText.replace(regex, " ");
    return cleanedText;
  };

  // caretX: the X position of the caret ie. cursor
  // element: this will be a DOM node for a word
  // simulatedElement: this will be the line that contains element. we need this to create a virtual DOM, in order to calculate distances and retrieve the index.
  const getLocalCaretIndex = (caretX, element, simulatedElement) => {
    const text = cleanDocumentText(element.innerText);
    const container = document.createElement("div");
    const letterSpans = [];

    for (let i = 0; i < text.length; i++) {
      const textNode = document.createElement("span");
      textNode.innerText = text[i];
      textNode.style.cssText = element.style.cssText;
      textNode.style.whiteSpace = "pre";
      letterSpans.push(textNode);
      container.appendChild(textNode);
    }

    container.style.whiteSpace = "nowrap";
    simulatedElement.appendChild(container);

    let index = 0;
    let currentMinimumDistance = -1;
    const containerRect = container.getBoundingClientRect();
    for (let i = 0; i < letterSpans.length; i++) {
      const letterRect = letterSpans[i].getBoundingClientRect();
      const letterLeft = letterRect.left - containerRect.left;
      const letterRight = letterRect.right - containerRect.right;
      if (currentMinimumDistance === -1) {
        currentMinimumDistance = Math.abs(caretX - letterLeft);
      }
      const leftDistance = Math.abs(caretX - letterLeft);
      const rightDistance = Math.abs(caretX - letterRight);

      if (leftDistance <= currentMinimumDistance) {
        index = i;
        currentMinimumDistance = leftDistance;
      }

      if (rightDistance <= currentMinimumDistance) {
        index = i + 1;
        currentMinimumDistance = rightDistance;
      }
    }

    container.remove();
    return index;
  };

  const lines = document.querySelectorAll(".kix-lineview");

  let selectedText = "";

  for (let i = 0; i < lines.length; i++) {
    const words = lines[i].querySelectorAll(".kix-wordhtmlgenerator-word-node");
    const selectionOverlays = lines[i].querySelectorAll(
      ".kix-selection-overlay"
    );
    for (let j = 0; j < words.length; j++) {
      const wordText = cleanDocumentText(words[j].textContent);
      const wordRect = words[j].getBoundingClientRect();
      for (let k = 0; k < selectionOverlays.length; k++) {
        const selectionOverlay = selectionOverlays[k];
        const selectionRect = selectionOverlay.getBoundingClientRect();

        if (areRectsOverlapping(wordRect, selectionRect)) {
          const selectionStartIndex = getLocalCaretIndex(
            selectionRect.left - wordRect.left,
            words[j],
            lines[i]
          );

          const selectionEndIndex = getLocalCaretIndex(
            selectionRect.left + selectionRect.width - wordRect.left,
            words[j],
            lines[i]
          );

          selectedText += wordText.substring(
            selectionStartIndex,
            selectionEndIndex
          );
        }
      }
    }
  }

  return selectedText;
};

registerHandler(
  "clickGoogleSelectionToLinkButton",
  message => {
    clickGoogleSelectionToLinkButton();
  },
  true
);

registerHandler(
  "getGoogleDocsSelection",
  message => {
    return { text: getGoogleDocsSelectedText() };
  },
  true
);
