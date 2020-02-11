this.moduleLoader = (function() {
  const exports = {};

  exports.loadModule = function(path) {
    const script = document.createElement("script");
    script.src = path;
    script.setAttribute("type", "module");
    document.head.appendChild(script);
  };

  exports.waitForModule = function(propName, objectName, func) {
    const timerId = setInterval(() => {
      if (window.ecmaModules[objectName]) {
        clearInterval(timerId);
        const module = func();
        window[propName] = module;
      }
    }, 100);
  };

  return exports;
})();

window.ecmaModules = {};
