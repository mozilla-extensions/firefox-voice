package mozilla.voice.assistant.language

import androidx.annotation.VisibleForTesting

/**
 * A representation of a sequence of [Word]s.
 */
class FullPhrase(
    @VisibleForTesting val words: Sequence,
    private val originalSource: String? = null,
    private val parameters: Map<String, String> = emptyMap(),
    private val intentName: String? = null
) : Pattern {
    override fun matchUtterance(match: MatchResult): List<MatchResult> {
        require(match.index == 0)
        return words.matchUtterance(match).mapNotNull {
            var result = it
            while (!result.utteranceExhausted() && result.utteranceWord().isStopWord) {
                result = result.clone(
                    addIndex = 1,
                    addSkipped = 1
                )
            }
            if (result.utteranceExhausted()) {
                result.clone(
                    parameters = parameters,
                    intentName = intentName
                )
            } else {
                null
            }
        }
    }

    override fun toString(): String {
        val paramString = if (parameters.isEmpty()) {
            ""
        } else {
            ", parameters=$parameters"
        }
        val intentString = intentName?.let { ", intentName=$it" } ?: ""
        return "FullPhrase(\"${words.toSource()}$paramString$intentString\")"
    }

    override fun toSource() = words.toSource()

    override fun slotNames() = words.slotNames()
}
