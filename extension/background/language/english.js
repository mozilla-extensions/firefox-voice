/*
Information specific to English words:

* `aliases`: canonical word forms vs an alias. Also includes often misheard words
* `stopwords`: words that can be ignored if it makes a match possible

*/

export const aliases = new Map();
export const multiwordAliases = new Map();
export const stopwords = new Set();

for (let line of `
# Each line is first the "proper" word, and a possible alias that could show up and should
# potentially be treated as the proper word
tab app
tab cat
tab tap
tab tech
tab top
on in
next nest
close closest
page webpage
site website
intents intense
intents interns
paste haste
paste taste
paste pace
paste best
downward down ward
upward up ward
`.split("\n")) {
  line = line.trim();
  if (!line || line.startsWith("#")) {
    continue;
  }
  const [proper, ...alias] = line.split(/\s+/g);
  if (alias.length === 1) {
    if (aliases.get(proper)) {
      aliases.get(proper).push(alias[0]);
    } else {
      aliases.set(proper, [alias[0]]);
    }
  } else if (multiwordAliases.get(proper)) {
    multiwordAliases.get(proper).push(alias);
  } else {
    multiwordAliases.set(proper, [alias]);
  }
}

for (let line of `
# Words from https://github.com/NaturalNode/natural/blob/master/lib/natural/util/stopwords.js#L25
a about above after again all also am an and another any are as at
be because been before being below between both but by
came can cannot come could did do does doing during each
few for from further get got has had he have her here him himself his how
if in into is it its itself like make many me might more most much must my myself
never now of on only or other our ours ourselves out over own
said same see should since so some still such
take than that the their theirs them themselves then there these they this those through to too
under until up very was way we well were what where when which while who whom with would why
you your yours yourself
`.split("\n")) {
  line = line.trim();
  if (!line || line.startsWith("#")) {
    continue;
  }
  for (const word of line.split(/\s+/g)) {
    stopwords.add(word);
  }
}
