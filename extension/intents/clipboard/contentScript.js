/* globals communicate, pageMetadataContentScript */

this.contentScript = (function() {
  const types = {};

  const meta = pageMetadataContentScript.getMetadata;

  function copyElement(el) {
    document.body.appendChild(el);
    const oldRanges = [];
    const sel = window.getSelection();
    for (let i = 0; i < sel.rangeCount; i++) {
      oldRanges.push(sel.getRangeAt(i));
    }
    sel.empty();
    const newRange = document.createRange();
    newRange.selectNode(el);
    sel.addRange(newRange);
    document.execCommand("copy");
    sel.empty();
    for (const range of oldRanges) {
      sel.addRange(range);
    }
    el.remove();
  }

  function createScreenshot({ x, y, width, height }) {
    const canvas = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "canvas"
    );
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.drawWindow(window, x, y, width, height, "#fff");
    return canvas.toDataURL();
  }

  function copyImage(url) {
    const img = document.createElement("img");
    img.src = url;
    copyElement(img);
  }

  function getDocumentWidth() {
    return Math.max(
      document.body && document.body.clientWidth,
      document.documentElement.clientWidth,
      document.body && document.body.scrollWidth,
      document.documentElement.scrollWidth
    );
  }

  function getDocumentHeight() {
    return Math.max(
      document.body && document.body.clientHeight,
      document.documentElement.clientHeight,
      document.body && document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
  }

  communicate.register("copy", message => {
    const { copyType } = message;
    const result = types[copyType]();
    if (result) {
      navigator.clipboard.writeText(result);
    }
  });

  types.copyLink = function() {
    return meta().canonical;
  };

  types.copyTitle = function() {
    return meta().title;
  };

  types.copyMarkdownLink = function() {
    const m = meta();
    return `[${m.title}](${m.canonical || m.url});`;
  };

  types.copySelection = function() {
    document.execCommand("copy");
  };

  types.copyRichLink = function() {
    const m = meta();
    const anchor = document.createElement("a");
    anchor.href = m.canonical;
    anchor.textContent = m.title;
    copyElement(anchor);
  };

  types.copyScreenshot = function() {
    const url = createScreenshot({
      x: window.scrollX,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    copyImage(url);
  };

  types.copyFullPageScreenshot = function(el) {
    const url = createScreenshot({
      x: 0,
      y: 0,
      height: getDocumentHeight(),
      width: getDocumentWidth(),
    });
    copyImage(url);
  };
})();
