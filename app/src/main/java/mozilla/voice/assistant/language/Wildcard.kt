package mozilla.voice.assistant.language

class Wildcard(
    private val empty: Boolean = false
) {
    fun matchUtterance(match: MatchResult): List<MatchResult> {
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
            results.add(results.last().clone())
        }
        return results
    }

    fun toSource() = if (this.empty) "*" else "+"

    fun slotNames() = emptySet<String>()
}
