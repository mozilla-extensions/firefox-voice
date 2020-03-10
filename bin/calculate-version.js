const package_json = require(__dirname + "/../package.json");
import semver from "semver";
import { engines } from "./package";

const version = engines.node;
if (!semver.satisfies(process.version, version)) {
  console.log(
    `Required node version ${version} not satisfied with current version ${process.version}.`
  );
  process.exit(1);
}
exports.getVersionNumber = function() {
  const BASELINE = 1567715368897; // Date.now() when this was first developed
  const timeDiff = Date.now() - BASELINE;
  const hours = Math.floor(timeDiff / 1000 / 60 / 60);
  const versionParts = package_json.version.split(".");
  versionParts[2] = String(hours);
  return versionParts.join(".");
};

if (require.main === module) {
  process.stdout.write(exports.getVersionNumber());
}
