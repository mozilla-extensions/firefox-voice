package mozilla.voice.assistant

import androidx.annotation.VisibleForTesting

class Matcher(
    private val phrase: String,
    private val slots: List<String>,
    private val slotTypes: Map<String, String>,
    private val parameters: Map<String, String>,
    @VisibleForTesting
    internal val regexString: String
) {
    private val regex = Regex("^$regexString$", RegexOption.IGNORE_CASE)

    fun match(utterance: String): MatcherResult? {
        return regex.find(" ${utterance.trim()}")?.run {
            MatcherResult (
                slots.indices.associate { i ->
                    slots[i] to groupValues[i + 1]
                },
                slotTypes,
                utterance,
                regexString,
                parameters)
        }
    }
}

class MatchSet(
    private val phrases: String
) {
    @VisibleForTesting
    val matchers: List<Matcher> =
        phrases.split("\n")
            .map { it.trim() }
            .filter { it.isNotEmpty() && !it.startsWith("#") && !it.startsWith("//") }
            .mapNotNull { MatcherBuilder(it).build() }

    fun match(utterance: String): MatcherResult? {
        // Returns first match
        matchers.forEach { matcher ->
            matcher.match(utterance) ?.let {
                return it
            }
        }
        return null
    }
}

data class MatcherResult(
    val slots: Map<String, String>,
    val slotTypes: Map<String, String>,
    val utterance: String,
    val regex: String?, // null when created by createFallbackIntent()
    val parameters: Map<String, String>
)

