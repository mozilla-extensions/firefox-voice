import * as email from "../../intents/email/email.js";
import * as browserUtil from "../../browserUtil.js";
import * as content from "../../background/content.js";

class Gmail {
  async compose(options) {
    let to = "";
    let searchFor = null;
    if (options.to) {
      if (options.to.includes("@")) {
        to = options.to;
      } else {
        searchFor = options.to;
      }
    }
    const subject = options.subject || "";
    const body = options.body || "";
    const url = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&source=mailto&to=${encodeURIComponent(
      to
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    console.log("!!! url:", url);
    const tab = await browserUtil.createTab({ url });
    if (searchFor) {
      await content.lazyInject(tab.id, `/services/gmail/contentScript.js`);
      await browser.tabs.sendMessage(tab.id, {
        type: "searchFor",
        searchFor,
      });
    }
  }
}

Object.assign(Gmail, {
  id: "gmail",
  title: "Gmail",
  baseUrl: "https://mail.google.com/",
});

email.register(Gmail);
