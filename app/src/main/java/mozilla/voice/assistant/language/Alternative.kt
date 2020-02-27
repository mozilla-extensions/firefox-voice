package mozilla.voice.assistant.language

class Alternative(
    private val alternatives: List<Pattern>,
    private val empty: Boolean = false
) : Pattern {
    override fun matchUtterance(match: MatchResult): List<MatchResult> {
        val results = alternatives.flatMap { pattern ->
            pattern.matchUtterance(match)
        }
        return if (empty) results + listOf(match) else results
    }

    override fun toSource() =
        alternatives.joinToString(
            separator = " | ",
            postfix = if (empty) "" else " | "
        ) { it.toSource() }

    override fun slotNames() =
        emptySet<String>().union(alternatives.flatMap { it.slotNames() })
}
