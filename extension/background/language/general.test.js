/* globals test, expect */

const { PhraseSet } = require("./matching.js");
const { compile, convertEntities } = require("./compiler.js");
const { MatchResult } = require("./textMatching.js");

function match(utterance, matchPhrase) {
  const match = new MatchResult({ utterance });
  return matchPhrase.matchUtterance(match);
}

test("compiler", () => {
  expect(
    compile(
      "(bring me | take me | go | navigate | show me | open) (to | find |) (page |) [query]"
    ).toString()
  ).toBe(
    'FullPhrase("(bring me | take me | go | navigate | show me | open) (to | find | ) (page | ) [query:+]")'
  );

  expect(
    compile("(unmute | turn on) (tab{s} | page{s}) (for me |)").toString()
  ).toBe(
    'FullPhrase("(unmute | turn on) (tab | tabs | page | pages) (for me | )")'
  );

  expect(compile("clear query (database | cache)").toString()).toBe(
    'FullPhrase("clear query (database | cache)")'
  );

  expect(
    compile("google images (of | for |) [query] [service=images]").toString()
  ).toBe(
    'FullPhrase("google images (of | for | ) [query:+]", parameters={"service":"images"})'
  );

  const entities = convertEntities({ lang: ["Spanish", "English"] });
  expect(
    compile(
      "translate (this |) (page | tab | article | site |) to [language:lang] (for me |)",
      { entities }
    ).toString()
  ).toBe(
    'FullPhrase("translate (this | ) (page | tab | article | site | ) to [language:(Spanish | English)] (for me | )")'
  );
});

test("compiler optional bits of words", () => {
  expect(compile("next result{s}").toString()).toBe(
    'FullPhrase("next (result | results)")'
  );

  expect(compile("next (result{s} | concern)").toString()).toBe(
    'FullPhrase("next (result | results | concern)")'
  );
});

test("basic matches", () => {
  const phrase = compile("this [query] test");
  const results = match("this is test", phrase);
  expect(results.toString()).toBe(
    'MatchResult("this is test^^", slots: {query: "is"}, capturedWords: 2)'
  );

  expect(match("this is 'not' test", phrase).toString()).toBe(
    "MatchResult(\"this is 'not' test^^\", slots: {query: \"is 'not'\"}, capturedWords: 2)"
  );

  expect(match("this test", phrase)).toEqual([]);

  expect(match("this no is testy", phrase)).toEqual([]);
});

test("alternative matches", () => {
  const phrase = compile("(hi | hello) world");

  expect(match("hello world", phrase).toString()).toBe(
    'MatchResult("hello world^^", capturedWords: 2)'
  );

  expect(match("hi world!!!", phrase).toString()).toBe(
    'MatchResult("hi world!!!^^", capturedWords: 2)'
  );

  expect(match("hello, my world", phrase).toString()).toBe(
    'MatchResult("hello, my world^^", skippedWords: 1, capturedWords: 2)'
  );
});

test("Stopwords", () => {
  const phrase = compile("(launch | open) (new |) (tab | page)");

  expect(match("launch new tab", phrase).toString()).toBe(
    'MatchResult("launch new tab^^", capturedWords: 3)'
  );

  expect(match("open new tab for me", phrase).toString()).toBe(
    'MatchResult("open new tab for me^^", skippedWords: 2, capturedWords: 3)'
  );

  expect(match("for me open new tab", phrase).toString()).toBe(
    'MatchResult("for me open new tab^^", skippedWords: 2, capturedWords: 3)'
  );
});

test("Aliases", () => {
  const phrase = compile("(launch | open) (new |) (tab | page)");

  expect(match("open new app", phrase).toString()).toBe(
    'MatchResult("open new app^^", aliasedWords: 1, capturedWords: 3)'
  );
});

test("Multiword aliases", () => {
  const phrase = compile("scroll upward");

  expect(match("scroll upward", phrase).toString()).toBe(
    'MatchResult("scroll upward^^", capturedWords: 2)'
  );
  expect(match("scroll up ward", phrase).toString()).toBe(
    'MatchResult("scroll up ward^^", aliasedWords: 2, capturedWords: 3)'
  );
});

test("Equations", () => {
  const phrase = compile("calculate [equation]");

  expect(match("calculate 2 + 3", phrase).toString()).toBe(
    'MatchResult("calculate 2 + 3^^", slots: {equation: "2 + 3"}, capturedWords: 1)'
  );
});

test("Prioritizing matches", () => {
  const fallback = compile("[query]", { intentName: "fallback" });
  const search = compile("search (for |) [query]", { intentName: "search" });
  const matchSet = new PhraseSet([fallback, search]);
  expect(matchSet.match("search for a test").toString()).toBe(
    'MatchResult("search for a test^^", slots: {query: "a test"}, intentName: search, capturedWords: 2)'
  );
  expect(matchSet.match("this is a fallback").toString()).toBe(
    'MatchResult("this is a fallback^^", slots: {query: "this is a fallback"}, intentName: fallback, capturedWords: 0)'
  );
  expect(matchSet.match("search for a a a a test").toString()).toBe(
    'MatchResult("search for a a a a test^^", slots: {query: "a a a a test"}, intentName: search, capturedWords: 2)'
  );
});
