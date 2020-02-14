export async function shouldDisplayWarning(warningName, { times, frequency }) {
  if (!(times || frequency)) {
    throw new Error("Must provide times and/or frequency arguments");
  }
  const key = `warning.${warningName}`;
  const info = (await browser.storage.local.get(key))[key];
  if (!info) {
    // it's never been run before
    browser.storage.local.set({ [key]: { times: 1, lastTime: Date.now() } });
    return true;
  }
  if (times && info.times >= times) {
    return false;
  }
  if (frequency && Date.now() - info.lastTime < frequency) {
    return false;
  }
  browser.storage.local.set({
    [key]: {
      times: info.times + 1,
      lastTime: Date.now(),
    },
  });
  return true;
}
