package mozilla.voice.assistant.intents

/**
 * The result of parsing a user utterance.
 */
class ParseResult(
    /**
     * The user utterance. If there were multiple transcriptions, this is the one
     * that was successfully parsed.
     */
    val utterance: String,

    /**
     * The name of the voice intent (as defined in the TOML file) used for the parse.
     */
    val name: String,

    /**
     * A mapping from the names of slots (such as "query") and their values.
     */
    val slots: Map<String, String>,

    /**
     * A mapping from the names of parameters (such as "mode") and their values.
     */
    val parameters: Map<String, String> = emptyMap(),

    /**
     * Whether the default "fallback" parse was used (treating all the text as input to a search engine).
     */
    val fallback: Boolean
)
