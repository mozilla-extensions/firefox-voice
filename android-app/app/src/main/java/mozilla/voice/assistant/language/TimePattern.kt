package mozilla.voice.assistant.language

/**
 * A [Pattern] that matches times in the form hh:mm, where 0 <= hh <= 23, and 0 <= mm <= 59.
 */
class TimePattern() : Pattern {
    override fun matchUtterance(match: MatchResult): List<MatchResult> {
        if (match.utteranceExhausted()) {
            return emptyList()
        }
        // Note that this looks at the source of the word, which might include characters
        // removed during normalization.
        if (extractTime(match.utteranceWord().toSource()) != null) {
            return listOf(
                match.clone(
                    addIndex = 1,
                    addWords = 1
                )
            )
        }
        return emptyList()
    }

    override fun toSource(): String = "<hh:mm>"

    override fun slotNames(): Set<String> = emptySet()

    companion object {
        private val TIME_REGEX = Regex("(\\d+):(\\d+)")

        internal fun extractTime(s: String): Pair<Int, Int>? =
            TIME_REGEX.matchEntire(s)?.let {
                val (hours, mins) = it.destructured
                val h = hours.toInt()
                val m = mins.toInt()
                if (h in 0..23 && m in 0..59) Pair(h, m) else null
            }
    }
}
