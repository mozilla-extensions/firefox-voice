package mozilla.voice.assistant

import androidx.annotation.VisibleForTesting

fun <T> Map<T, T>.getOrKey(key: T): T = this[key] ?: key

class IntentParser {
    companion object {
        // Populated by registerMatcher
        @VisibleForTesting
        val intents = mutableMapOf<String, Matcher>()
        @VisibleForTesting
        val intentNames = mutableListOf<String>()

        fun registerMatcher(intentName: String, matcher: Matcher) {
            if (intents.contains(intentName)) {
                throw Error("Intent $intentName has already been registered")
            }
            intentNames.add(intentName)
            intents[intentName] = matcher
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


        fun findMatches(text: String): List<MatcherResult>? {
            intents.map {entry ->
                entry.value.match(text) ?. let {
                    val penalty = it.slots.map { entry ->
                        if (it.slotTypes.contains(entry.key)) {
                            1
                        } else {
                            entry.value.length
                        }
                    }
                }
            }
            // pick up here
        }

        // example: "up word" -> Pair(Regex("\\bup ward\\b"), "upward")
        private val SUB_REGEXES: Map<String, Pair<Regex, String>> =
            SUBSTITUTIONS.mapValues { (key, value) ->
                Pair(Regex("\\b$key\\b", RegexOption.IGNORE_CASE), value)
            }

        private val SUB_REGEX = Regex(
            SUBSTITUTIONS.keys.joinToString(
                prefix = "\\b(",
                separator = "|",
                postfix = ")\\b"
            ),
            RegexOption.IGNORE_CASE
        )

        fun parse(unnormalizedText: String, disableFallback: Boolean = false) {
            val text = normalizeText(unnormalizedText)
            val alternatives = mutableListOf<Pair<String, Int>>(
                Pair(text, 0)
            )

            // Add an alternative trying each substitution individually. The score is the
            // difference in text length minus the number of times the substitution was done.
            for (value in SUB_REGEXES.values) {
                val (re, sub) = value
                var c = 0 // count of number of times this substitution is made in text
                val newText = text.replace(re) {
                    c += 1
                    sub
                }
                // learned a nicer way on Slack

                //val c = re.findAll(text).asSequence().count()
                //val newText = text.replace(re, sub)

                if (newText != text) {
                    alternatives.add(
                        Pair(
                            normalizeText(newText),
                            -c + newText.length - text.length
                        )
                    )
                }
            }

            // Now try all of the substitutions at once.
            var c = 0
            val newText = text.replace(SUB_REGEX) { matchResult ->
                c += 1
                // Compiler cannot infer that SUBSTITUTIONS[matchResult.value] returns String, not String?
                SUBSTITUTIONS.getOrKey(matchResult.value)
            }
            if (newText != text) {
                alternatives.add(
                    Pair(
                        normalizeText(newText),
                        -c + (newText.length - text.length)
                    )
                )
            }
        }
    }
}

class Match(
    val matcherResult: MatcherResult,
    val name: String,
    val fallback: Boolean,
    val score: Int
)
