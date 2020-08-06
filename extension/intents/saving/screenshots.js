/* Note this has to be run from content */

export function visibleScreenshot() {
  const url = createScreenshot({
    x: window.scrollX,
    y: window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
  });
  return url;
}

export function fullPageScreenshot() {
  const url = createScreenshot({
    x: 0,
    y: 0,
    height: getDocumentHeight(),
    width: getDocumentWidth(),
  });
  return url;
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
