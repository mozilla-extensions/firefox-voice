package mozilla.voice.assistant.language

/**
 * A representation of a slot whose value is specified by the associated [Pattern].
 * For example, the phrase "search for \[query\]" would include a slot with the name
 * "query" and the pattern [Wildcard].
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
