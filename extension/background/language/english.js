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
link like
next text
# Seems like a bad substitution, but seen in the wild...
open pooping
open poop
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
# Words from https://github.com/explosion/spaCy/blob/e0cf4796a505bd26e8fcb95d23b89fd7eca3be0a/spacy/lang/en/stop_words.py
a about above across after afterwards again against all almost alone along
already also although always am among amongst amount an and another any anyhow
anyone anything anyway anywhere are around as at
back be became because become becomes becoming been before beforehand behind
being below beside besides between beyond both bottom but by
call can cannot ca could
did do does doing done down due during
each eight either eleven else elsewhere empty enough even ever every
everyone everything everywhere except
few fifteen fifty first five for former formerly forty four from front full
further
get give go
had has have he hence her here hereafter hereby herein hereupon hers herself
him himself his how however hundred
i if in indeed into is it its itself
keep
last latter latterly least less
just
made make many may me meanwhile might mine more moreover most mostly move much
must my myself
# Removing 'not' since it seems important...
name namely neither never nevertheless next nine no nobody none noone nor
nothing now nowhere
of off often on once one only onto or other others otherwise our ours ourselves
out over own
part per perhaps please put
quite
rather re really regarding
same say see seem seemed seeming seems serious several she should show side
since six sixty so some somehow someone something sometime sometimes somewhere
still such
take ten than that the their them themselves then thence there thereafter
thereby therefore therein thereupon these they third this those though three
through throughout thru thus to together too top toward towards twelve twenty
two
under until up unless upon us used using
various very very via was we well were what whatever when whence whenever where
whereafter whereas whereby wherein whereupon wherever whether which while
whither who whoever whole whom whose why will with within without would
yet you your yours yourself yourselves
`.split("\n")) {
  line = line.trim();
  if (!line || line.startsWith("#")) {
    continue;
  }
  for (const word of line.split(/\s+/g)) {
    stopwords.add(word);
  }
}
