import * as email from "../../intents/email/email.js";
import * as browserUtil from "../../browserUtil.js";

class Gmail {
  async compose(options) {
    const to = options.to;
    const subject = options.subject || "";
    const body = options.body || "";
    const url = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&source=mailto&to=${encodeURIComponent(
      to
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    await browserUtil.createTab({ url });
  }
}

Object.assign(Gmail, {
  id: "gmail",
  title: "Gmail",
  baseUrl: "https://mail.google.com/",
});

email.register(Gmail);
