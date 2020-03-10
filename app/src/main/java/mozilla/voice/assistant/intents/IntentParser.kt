package mozilla.voice.assistant.intents

import mozilla.voice.assistant.language.PhraseSet

class IntentParser(private val phraseSet: PhraseSet) {
    internal fun parse(text: String, disableFallback: Boolean = false): ParseResult? =
        phraseSet.match(text)?.let { matchResult ->
            ParseResult(
                name = matchResult.intentName
                    ?: throw error("MatchResult in parse() lacks intentName"),
                slots = matchResult.stringSlots(),
                parameters = matchResult.parameters,
                utterance = text,
                fallback = false
            )
        } ?: if (disableFallback) {
            null
        } else {
            ParseResult(
                name = DEFAULT_INTENT,
                slots = mapOf(DEFAULT_SLOT to text),
                utterance = text,
                fallback = true
            )
        }

    companion object {
        private const val DEFAULT_INTENT = "search.search"
        private const val DEFAULT_SLOT = "query"
    }
}

class ParseResult(
    val utterance: String,
    val name: String,
    val slots: Map<String, String>,
    val parameters: Map<String, String> = emptyMap(),
    val fallback: Boolean
)
