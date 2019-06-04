// tabContent.js

(function() {
    const tabContents = {
        title: document.title,
        url: document.URL,
        body: document.body.innerText
    }
    console.log("do i get there?");
    console.log(tabContents);
    return tabContents;
})();