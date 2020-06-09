/* globals QRCode */

async function init() {
  const url = await browser.runtime.sendMessage({
    type: "getDeviceUrl",
  });
  const anchor = document.querySelector("#url");
  anchor.href = url;
  anchor.textContent = url;
  const prefix = "https://mozilla.github.io/firefox-voice/crossdevice/";
  const urlLocal = "./demo.html" + url.substr(prefix.length);
  const anchorLocal = document.querySelector("#url-local");
  anchorLocal.href = urlLocal;
  anchorLocal.textContent = urlLocal;
  const qr = document.querySelector("#qrcode");
  new QRCode(qr, url);
}

init();
