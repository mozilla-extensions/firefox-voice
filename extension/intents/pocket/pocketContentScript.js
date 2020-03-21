/* globals communicate */

this.pocketContentScript = (function() {
    communicate.register("save", async message => {
        const url = message.url;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://getpocket.com/save?url=" + url, true);
        xhr.send();
    });
})();
