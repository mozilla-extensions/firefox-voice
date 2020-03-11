package mozilla.voice.assistant.language

/**
 * A [Pattern] that matches strings directly representing natural numbers, consisting of one or more
 * base-ten digits. This could be modified in the future to optionally match
 * other types of numbers.
 */
class NumberPattern(
    // Add options for different types of numbers if needed
) : Pattern {
    override fun matchUtterance(match: MatchResult): List<MatchResult> =
        if (match.utteranceExhausted() || !NATURAL_NUM_REGEX.matches(match.utteranceWord().toSource())) {
            emptyList()
        } else {
            listOf(
                match.clone(
                    addIndex = 1,
                    addWords = 1
                )
            )
        }

    override fun toSource(): String = "<number>"

    override fun slotNames(): Set<String> = emptySet()

    companion object {
        private val NATURAL_NUM_REGEX = Regex("\\d+")
    }
}
