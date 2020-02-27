package mozilla.voice.assistant.language

/**
 * A representation of a slot whose value is specified by the associated pattern.
 * For example, the slot in "search for [query]", whose name is "query" and whose
 * pattern is a [Wildcard].
 */
class Slot(private val pattern: Pattern, private val slotName: String) : Pattern {
    override fun matchUtterance(match: MatchResult): List<MatchResult> =
        pattern.matchUtterance(match).map { result ->
            result.clone(
                slots = mapOf(slotName to match.utterance.slice(match.index until result.index))
            )
        }

    override fun toSource() = "[$slotName:${pattern.toSource()}]"

    override fun slotNames() = setOf(slotName)
}
