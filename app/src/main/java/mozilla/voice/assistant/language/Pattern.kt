package mozilla.voice.assistant.language

/***
 * Implements matching.

The most important class here is `MatchResult`, which tracks the match result, and
during the match process it keeps track of the progress in matching.

A `Word` represents both a word in the utterance and a word to match in a phrase.

An `Alternative` represents several alternatives.

A `Sequence` represents several words or other matchers that must match in order.

A `Wildcard` matches one or more words.

A `Slot` matches something, and captures what is matched in a slot.

A `FullPhrase` matches a sequence, and requires all the words to be matched.

The most important method across these is `.matchUtterance(aMatchResult)`. This returns
a list of `MatchResult` objects, all possible matches.
 */

interface Pattern {
    fun matchUtterance(match: MatchResult): List<MatchResult>

    fun toSource(): String

    fun slotNames(): Set<String>
}
