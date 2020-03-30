/* globals communicate, Fuse */

this.dictationContentScript = (function() {
  const PASTE_SELECTORS = [
    "textarea",
    "*[contenteditable]",
    `
    input[type=text],
    input[type=search],
    input[type=url],
    input[type=email],
    input[type=password],
    input[type=date],
    input[type=datetime-local],
    input[type=time],
    input[type=color]
    `,
  ];
  const COMBINED_SELECTORS = PASTE_SELECTORS.join(", ");
  const DEFAULT_FOCUS_TIME = 500;

  function isPasteable(el) {
    while (el && el.tagName) {
      if (["INPUT", "TEXTAREA"].includes(el.tagName)) {
        return true;
      }
      if (el.getAttribute("contenteditable")) {
        return true;
      }
      el = el.parentNode;
    }
    return false;
  }

  function isInViewport(el) {
    const width = window.innerWidth || document.documentElement.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight;
    const bounding = el.getBoundingClientRect();
    return (
      bounding.top + bounding.height >= 0 &&
      bounding.left + bounding.width >= 0 &&
      bounding.right - bounding.width <= width &&
      bounding.bottom - bounding.height <= height
    );
  }

  function quoteHtml(text) {
    text = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
    return text;
  }

  function highlightElement(el) {
    const oldBackground = el.style.backgroundColor;
    el.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
    setTimeout(() => {
      el.style.backgroundColor = oldBackground;
    }, 1000);
  }

  communicate.register("enterText", async message => {
    const { text } = message;
    let timeout = 0;
    let el;
    if (!isPasteable(document.activeElement)) {
      for (const selector of PASTE_SELECTORS) {
        el = document.querySelector(selector);
        if (el && isInViewport(el)) {
          break;
        }
      }
      if (!el) {
        for (const selector of PASTE_SELECTORS) {
          el = document.querySelector(selector);
          if (el) {
            break;
          }
        }
      }
      if (el) {
        el.focus();
        timeout = DEFAULT_FOCUS_TIME;
      }
    } else {
      el = document.activeElement;
    }
    setTimeout(() => {
      if (el.hasAttribute("contenteditable")) {
        // eslint-disable-next-line no-unsanitized/property
        el.innerHTML = insertString(
          el.innerHTML,
          quoteHtml(text),
          el.selectionStart
        );
      } else {
        el.value = insertString(el.value, text, el.selectionStart);
      }
      highlightElement(el);
    }, timeout);
  });

  communicate.register("focusField", async message => {
    const { label } = message;
    const elements = [];
    const searchContent = [];
    for (const el of document.querySelectorAll(COMBINED_SELECTORS)) {
      elements.push(el);
      let elLabel;
      if (el.id) {
        elLabel = document.querySelector(`label[for="${el.id}"]`);
        if (elLabel) {
          elLabel = elLabel.innerText;
        }
      }
      searchContent.push({
        element: el,
        placeholder: el.getAttribute("placeholder"),
        label: elLabel,
        value: el.value,
        title: el.getAttribute("title"),
        elementId: el.id,
        className: el.className,
      });
    }
    const options = {
      shouldSort: true,
      tokenize: true,
      matchAllTokens: true,
      findAllMatches: true,
      includeScore: true,
      threshold: 0.1,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 3,
      keys: [
        {
          name: "label",
          weight: 0.8,
        },
        {
          name: "placeholder",
          weight: 0.8,
        },
        {
          name: "title",
          weight: 0.8,
        },
        {
          name: "value",
          weight: 0.3,
        },
        {
          name: "elementId",
          weight: 0.1,
        },
        {
          name: "className",
          weight: 0.1,
        },
      ],
    };
    const fuse = new Fuse(searchContent, options);
    const matches = fuse.search(label);
    if (!matches.length) {
      return false;
    }
    const el = matches[0].item.element;
    focus(el);
    return true;
  });

  communicate.register("focusNext", async message => {
    return focusDirection(1);
  });

  communicate.register("formSubmit", async message => {
    if (document.activeElement.form === null) {
      const e = new Error("No input field has been focussed");
      e.displayMessage =
        "Please focus on an input field before trying to submit";
      throw e;
    } else {
      document.activeElement.form.submit();
    }
    return true;
  });

  communicate.register("focusPrevious", async message => {
    return focusDirection(-1);
  });

  communicate.register("turnSelectionIntoLink", async message => {
    const url = message.url;
    const text = message.text;
    let el;
    if (!isPasteable(document.activeElement)) {
      for (const selector of PASTE_SELECTORS) {
        el = document.querySelector(selector);
        if (el && isInViewport(el)) {
          break;
        }
      }
    } else {
      el = document.activeElement;
    }
    while (el) {
      if (el.hasAttribute("contenteditable")) {
        replaceSelectedText(text, url);
        break;
      } else if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
        const markdownLink = `[${text}](${url})`;
        replaceSelectedText(text, markdownLink);
        break;
      }
      el = el.parentNode;
    }
  });

  function focus(element) {
    element.focus();
    highlightElement(element);
  }

  function insertString(sourceString, snippet, position = null) {
    if (position === null) {
      position = sourceString.length;
    }

    const startSlice = sourceString.slice(0, position);
    const endSlice = sourceString.slice(position);

    let spaceBefore, spaceAfter;

    if (position === 0) {
      spaceBefore = "";
      spaceAfter = endSlice.startsWith(" ") ? "" : " ";
    } else if (position > 0 && position < sourceString.length) {
      spaceBefore = startSlice.endsWith(" ") ? "" : " ";
      spaceAfter = endSlice.startsWith(" ") ? "" : " ";
    } else {
      spaceBefore = startSlice.endsWith(" ") ? "" : " ";
      spaceAfter = "";
    }

    return `${startSlice}${spaceBefore}${snippet}${spaceAfter}${endSlice}`;
  }

  function focusDirection(dir) {
    // FIXME: we could be making use of tabindex, but it's pretty complicated, so...
    const elements = Array.from(document.querySelectorAll(COMBINED_SELECTORS));
    if (!elements.length) {
      return;
    }
    const active = document.activeElement;
    if (!active) {
      // Then we'll just focus the first or last item
      if (dir === 1) {
        focus(elements[0]);
      } else {
        focus(elements[elements.length - 1]);
      }
      return;
    }
    for (let i = 0; i < elements.length; i++) {
      if (elements[i] === active) {
        if (dir === 1) {
          if (!elements[i + 1]) {
            focus(elements[0]);
          } else {
            focus(elements[i + 1]);
          }
        } else if (!elements[i - 1]) {
          focus(elements[elements.length - 1]);
        } else {
          focus(elements[i - 1]);
        }
        return;
      }
    }
    // The active element isn't in the list, probably it's something that we dont'
    // think of as "editable"
    focus(elements[0]);
  }

  function replaceSelectedText(text, url) {
    let sel, range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        const anchor = document.createElement("a");
        anchor.textContent = text;
        anchor.href = url;
        range.insertNode(anchor);
      }
    } else if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      range.text = text;
    }
  }
})();
