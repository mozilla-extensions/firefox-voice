package mozilla.voice.assistant.language

/**
 * A representation of a sequence of patterns that must be matched in order.
 */
class Sequence(private val patterns: List<Pattern>) : Pattern {
    // TODO: Change to recursive function.
    override fun matchUtterance(match: MatchResult): List<MatchResult> {
        var results = listOf(match)
        patterns.forEach { pattern ->
            results = results.flatMap { previousMatch ->
                pattern.matchUtterance(previousMatch)
            }
        }
        return results
    }

    override fun toSource(): String = patterns.joinToString(separator = " ") { it.toSource() }

    override fun slotNames(): Set<String> =
        emptySet<String>().union<String>(patterns.flatMap { it.slotNames() })
}
