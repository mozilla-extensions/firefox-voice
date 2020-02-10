package mozilla.voice.assistant

import androidx.annotation.VisibleForTesting

fun <T> Map<T, T>.getOrKey(key: T): T = this[key] ?: key

class IntentParser {
    companion object {
        // Populated by registerMatcher
        @VisibleForTesting
        val INTENT_NAMES = mutableListOf<String>() // all caps to match JS code
        @VisibleForTesting
        val INTENTS = mutableMapOf<String, MatcherSet>() // all caps to match JS code

        private const val DEFAULT_INTENT = "search.search"
        private const val DEFAULT_SLOT = "query"

        fun registerMatcher(intentName: String, match: List<String>) {
            if (INTENTS.contains(intentName)) {
                throw Error("Intent $intentName has already been registered")
            }
            INTENT_NAMES.add(intentName)
            INTENTS[intentName] = MatcherSet(intentName, match)
        }

        @VisibleForTesting
        fun normalizeText(text: String): String =
            text.trim()
                .replace(Regex("\\s\\s+"), " ") // squash multiple spaces
                .replace(Regex("[.,;!?]\\B"), "") // remove punctuation at word boundaries

        // We will consider matches where we have to make these substitutions in order to get an exact
        // match for an intent pattern. It both considers doing ALL the substitutions, and doing each
        // substitution alone. (But all possible combinations are not attempted.)
        // FIXME: we should make these substitutions in the matcher, not the incoming text
        // Note: the substitution should be equal length or shorter than the original word
        private val SUBSTITUTIONS = mapOf(
            "the" to "",
            "my" to "",
            "app" to "tab",
            "cat" to "tab",
            "tap" to "tab",
            "tech" to "tab",
            "top" to "tab",
            "current tab" to "tab",
            "for me" to "",
            "in" to "on",
            "nest" to "next",
            "closest" to "close",
            "webpage" to "page",
            "website" to "site",
            "intense" to "intents",
            "interns" to "intents",
            "down word" to "downward",
            "up word" to "upward"
        )

        @VisibleForTesting
        fun createSubRegex(substitutions: Map<String, String>): Regex =
            Regex(
                substitutions.keys.joinToString(
                    prefix = "\\b(",
                    separator = "|",
                    postfix = ")\\b"
                ),
                RegexOption.IGNORE_CASE
            )

        private val SUB_REGEX = createSubRegex(SUBSTITUTIONS)

        @VisibleForTesting
        fun createSubRegexes(substitutions: Map<String, String>):
                Map<String, Pair<Regex, String>> =
            substitutions.mapValues { (key, value) ->
                Pair(Regex("\\b$key\\b", RegexOption.IGNORE_CASE), value)
            }

        private val SUB_REGEXES: Map<String, Pair<Regex, String>> =
            createSubRegexes((SUBSTITUTIONS))

        @VisibleForTesting
        fun findAlternatives(
            unnormalizedText: String,
            substitutions: Map<String, String> = SUBSTITUTIONS,
            sub_regex: Regex = SUB_REGEX,
            sub_regexes: Map<String, Pair<Regex, String>> = SUB_REGEXES
        ): List<Alternative> {
            val text = normalizeText(unnormalizedText)
            val alternatives = mutableListOf<Alternative>(
                Alternative(text, 0)
            )

            // Add an alternative trying each substitution individually. The score is the
            // difference in text length minus the number of times the substitution was done.
            for (value in sub_regexes.values) {
                val (re, sub) = value
                var count = 0 // count of number of times this substitution is made in text
                val newText = text.replace(re) {
                    count += 1
                    sub
                }

                if (newText != text) {
                    alternatives.add(
                        Alternative(
                            normalizeText(newText),
                            -count + newText.length - text.length
                        )
                    )
                }
            }

            // Now add an alternative where all substitutions are applied together.
            var count = 0
            val newText = text.replace(sub_regex) { matchResult ->
                count += 1
                // Compiler cannot infer that SUBSTITUTIONS[matchResult.value] returns String, not String?
                substitutions.getOrKey(matchResult.value)
            }
            if (newText != text) {
                alternatives.add(
                    Alternative(
                        normalizeText(newText),
                        -count + (newText.length - text.length)
                    )
                )
            }

            return alternatives
        }

        fun findMatches(text: String): List<MatcherResult>? {
            return INTENTS.mapNotNull { intent ->
                intent.value.match(text)?.let {
                    val penalty = it.slots.map { entry ->
                        if (it.slotTypes.contains(entry.key)) {
                            1
                        } else {
                            entry.value.length
                        }
                    }.sum()
                    it.fallback = false
                    it.score = text.length - penalty
                    it
                }
            }
        }

        fun parse(unnormalizedText: String, disableFallback: Boolean = false): MatcherResult? {
            // Find best alternative. TODO: Determine if we need to keep the revised score.
            val bestMatch = findAlternatives(unnormalizedText).flatMap {
                findMatches(it.altText)?.map { match ->
                    match.score += it.scoreMod
                    match
                } ?: emptyList()
            }.maxBy { it.score }

            return bestMatch ?: if (disableFallback) {
                null
            } else {
                createFallbackMatch(normalizeText(unnormalizedText))
            }
        }

        @VisibleForTesting
        fun createFallbackMatch(text: String): MatcherResult =
            MatcherResult(
                slots = mapOf(DEFAULT_SLOT to text),
                slotTypes = emptyMap(),
                parameters = emptyMap(),
                regex = null,
                utterance = text,
                name = DEFAULT_INTENT,
                fallback = true,
                score = 0 // unused
            )
    }
}

data class Alternative(
    val altText: String,
    val scoreMod: Int
)
