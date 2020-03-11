import { languageNames } from "./languages.js";
import { metadata } from "../services/metadata.js";
import { convertEntities } from "./language/compiler.js";

export const allServiceNames = [];

for (const id in metadata.search) {
  const item = metadata.search[id];
  for (const name of item.names) {
    allServiceNames.push(name);
  }
}

export const musicServiceNames = [];

for (const id in metadata.music) {
  const item = metadata.music[id];
  for (const name of item.names) {
    musicServiceNames.push(name);
  }
}

export const entityTypes = convertEntities({
  serviceName: allServiceNames,
  musicServiceName: musicServiceNames,
  lang: languageNames(),
  smallNumber: [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ],
});
