package mozilla.voice.assistant

import androidx.annotation.VisibleForTesting
import mozilla.voice.assistant.language.Compiler
import mozilla.voice.assistant.language.Pattern
import mozilla.voice.assistant.language.PhraseSet

fun <T> Map<T, T>.getOrKey(key: T): T = this[key] ?: key

class IntentParser {
    companion object {
        private var initialized = false
        private val compiledPhrases = mutableListOf<Pattern>()
        private lateinit var phraseSet: PhraseSet

        // Populated by registerMatcher
        @VisibleForTesting
        private val INTENT_NAMES = mutableListOf<String>() // all caps to match JS code

        private const val DEFAULT_INTENT = "search.search"
        private const val DEFAULT_SLOT = "query"

        internal fun registerMatcher(intentName: String, match: List<String>) {
            if (initialized) {
                throw Error("Late attempt to register intent $intentName")
            }
            if (INTENT_NAMES.contains(intentName)) {
                throw Error("Intent $intentName has already been registered")
            }
            INTENT_NAMES.add(intentName)
            match.forEach {
                // TODO: Add entity names
                compiledPhrases.add(Compiler.compile(it, emptyMap(), intentName))
            }
        }

        internal fun initialize() {
            require(!initialized)
            phraseSet = PhraseSet(compiledPhrases)
            initialized = true
        }

        internal fun getIntentNames() = INTENT_NAMES

        internal fun parse(text: String, disableFallback: Boolean = false): ParseResult? {
            require(initialized)
            val matchResult = phraseSet.match(text)
            if (matchResult == null) {
                return if (disableFallback) {
                    null
                } else {
                    ParseResult(
                        name = DEFAULT_INTENT,
                        slots = mapOf(DEFAULT_SLOT to text),
                        utterance = text,
                        fallback = true
                    )
                }
            }
            return ParseResult(
                name = matchResult.intentName ?: throw error("MatchResult in parse() lacks intentName"),
                slots = matchResult.stringSlots(),
                parameters = matchResult.parameters,
                utterance = text,
                fallback = false
            )
        }
    }
}

class ParseResult(
    val utterance: String,
    val name: String,
    val slots: Map<String, String>,
    val parameters: Map<String, String> = emptyMap(),
    val fallback: Boolean
)
