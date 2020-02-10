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
            MatcherResult(
                slots.indices.associate { i ->
                    slots[i] to groupValues[i + 1].trim()
                },
                slotTypes,
                utterance,
                regexString,
                parameters
            )
        }
    }
}

data class MatcherResult(
    val slots: Map<String, String>,
    val slotTypes: Map<String, String>,
    val utterance: String,
    val regex: String?, // null when created by createFallbackIntent()
    val parameters: Map<String, String>,
    var score: Int = 0,
    var fallback: Boolean = false,
    var name: String? = null
)

class MatcherSet(
    private val name: String,
    phrases: List<String>
) {
    @VisibleForTesting
    val matchers: List<Matcher> =
        phrases
            .map { it.trim() }
            .filter { it.isNotEmpty() && !it.startsWith("#") && !it.startsWith("//") }
            .mapNotNull { MatcherBuilder(it).build() }

    fun match(utterance: String): MatcherResult? {
        // Returns first match
        matchers.forEach { matcher ->
            matcher.match(utterance)?.let {
                it.name = name
                return it
            }
        }
        return null
    }
}
