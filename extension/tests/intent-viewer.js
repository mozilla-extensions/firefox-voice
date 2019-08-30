const BASE_VIEW_URL =
  "https://github.com/mozilla/firefox-voice/blob/master/extension/intents";

function makeViewUrl(name) {
  name = name.split(".")[0];
  return `${BASE_VIEW_URL}/${name}/${name}.js`;
}

function quote(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

async function init() {
  const intents = await browser.runtime.sendMessage({
    type: "getIntentSummary",
  });
  const html = [];
  for (const intent of intents) {
    const matchers = intent.matchers.map(m => {
      return `
      <section>
        Phrase: <code>${quote(m.phrase)}</code><br>
        Regex: <code>${quote(m.regex)}</code><br>
        ${
          m.slots && m.slots.length
            ? "Slots: <code>" + quote(m.slots) + "</code><br>"
            : ""
        }
      </section>
      `;
    });
    let examples = "";
    if (intent.examples) {
      examples = intent.examples.map(e => {
        return `
        <section>
          Example: <code>${quote(e.text)}</code><br>
          ${
            e.parsedIntent === intent.name
              ? ""
              : "ERROR, parsed as: " + e.parsedIntent + "<br>"
          }
          ${
            e.slots && Object.keys(e.slots).length
              ? "Slots: <code>" + quote(JSON.stringify(e.slots)) + "</code><br>"
              : ""
          }
        </section>
        `;
      });
    }
    html.push(`<div class="intent">
      <h2>${intent.name}</h2>
      <a href="${quote(makeViewUrl(intent.name))}">View code</a><br>
      ${intent.priority ? "Priority: " + intent.priority + "<br>" : ""}
      <div>
        <h3>Matchers</h3>
        ${matchers.join("\n")}
      </div>
      <div>
        <h3>Examples</h3>
        ${examples}
      </div>
    </div>`);
  }
  // eslint-disable-next-line no-unsanitized/property
  document.querySelector("#container").innerHTML = html.join("\n");
}

init();
