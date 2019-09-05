const package_json = require(__dirname + "/../package.json");
const BASELINE = 1567715368897; // Date.now() when this was first developed
const timeDiff = Date.now() - BASELINE;
const hours = Math.floor(timeDiff / 1000 / 60 / 60);
const versionParts = package_json.version.split(".");
versionParts[2] = String(hours);
process.stdout.write(versionParts.join("."));
