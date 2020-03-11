this.moduleLoader = (function() {
  const exports = {};

  exports.loadModule = function(path) {
    const script = document.createElement("script");
    script.src = path;
    script.setAttribute("type", "module");
    document.head.appendChild(script);
  };

  exports.waitForModule = function(objectName, func) {
    const timerId = setInterval(() => {
      if (window.ecmaModules[objectName]) {
        clearInterval(timerId);
        func();
      }
    }, 100);
  };

  return exports;
})();

window.ecmaModules = {};
