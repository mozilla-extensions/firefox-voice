async function init() {
  const timing = await browser.runtime.sendMessage({
    type: "getTimings",
  });
  const table = document.querySelector("#timing");
  let lastStart = 0;
  for (const line of timing) {
    const row = document.createElement("tr");
    if (line.start) {
      lastStart = line.time;
      row.className = "group";
    }
    const time = document.createElement("td");
    time.textContent = String(line.time);
    row.appendChild(time);
    const diff = document.createElement("td");
    diff.textContent = String(line.time - lastStart);
    row.appendChild(diff);
    const name = document.createElement("td");
    name.textContent = line.name;
    row.appendChild(name);
    table.appendChild(row);
  }
}

init();
