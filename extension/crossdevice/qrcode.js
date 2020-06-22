/* globals QRCode */

async function init() {
  const url = await browser.runtime.sendMessage({
    type: "getDeviceUrl",
  });
  const anchor = document.querySelector("#url");
  anchor.href = url;
  anchor.textContent = url;
  const qr = document.querySelector("#qrcode");
  new QRCode(qr, url);
}

init();
