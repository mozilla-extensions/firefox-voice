package mozilla.voice.assistant.language

/**
 * A wildcard matches one or more words (zero or more if property empty is true).
 */
class Wildcard(
    private val empty: Boolean = false // whether it matches the empty string
) : Pattern {
    override fun matchUtterance(match: MatchResult): List<MatchResult> {
        // Note that we handle empty things differently, so we always capture at least
        // one word here
        if (match.utteranceExhausted()) {
            return if (empty) listOf(match) else emptyList()
        }

        val results = mutableListOf<MatchResult>()
        if (empty) {
            results += match
        }
        results.add(match.clone(addIndex = 1))
        while (!results.last().utteranceExhausted()) {
            // Note wildcards don't act like they captured words
            results.add(results.last().clone(addIndex = 1))
        }
        return results
    }

    override fun toSource() = if (this.empty) "*" else "+"

    override fun slotNames() = emptySet<String>()
}
