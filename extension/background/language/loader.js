/* eslint-disable no-console */
/* Note: this is an ECMA module to expose key language things to the non-ECMA modules */

import { PhraseSet } from "./matching.js";
import { compile, convertEntities, splitPhraseLines } from "./compiler.js";
import { MatchResult } from "./textMatching.js";

if (!window.ecmaModules) {
  console.error("ecmaModules has not been created");
} else if (window.ecmaModules.language) {
  console.error("ecmaModules.language has already been defined");
}

window.ecmaModules.language = {
  PhraseSet,
  compile,
  convertEntities,
  splitPhraseLines,
  MatchResult,
};
