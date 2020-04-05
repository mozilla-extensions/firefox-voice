package mozilla.voice.assistant.language

/**
 * A [Pattern] that matches times in the form hh:mm, where 0 <= hh <= 23, and 0 <= mm <= 59.
 */
class TimePattern : Pattern {
    override fun matchUtterance(match: MatchResult): List<MatchResult> =
        when {
            match.utteranceExhausted() -> emptyList()
            extractTime(match.utteranceWord().toSource()) == null -> emptyList()
            else -> listOf(
                match.clone(
                    addIndex = 1,
                    addWords = 1
                )
            )
        }

    override fun toSource(): String = "<hh:mm>"

    override fun slotNames(): Set<String> = emptySet()

    companion object {
        private val TIME_REGEX = Regex("(\\d+):(\\d+)")
        private const val MAX_HOUR = 23
        private const val MAX_MINUTE = 59

        internal fun extractTime(s: String): Pair<Int, Int>? =
            TIME_REGEX.matchEntire(s)?.let {
                val (hours, mins) = it.destructured
                val h = hours.toInt()
                val m = mins.toInt()
                if (h in 0..MAX_HOUR && m in 0..MAX_MINUTE) Pair(h, m) else null
            }
    }
}
