/* We can't load ECMA modules through manifest.json, so this loads main.js as a module in the background page */
window.isBackgroundPage = true;

(function() {
  const script = document.createElement("script");
  script.src = "/background/main.js";
  script.setAttribute("type", "module");
  document.head.appendChild(script);
})();
