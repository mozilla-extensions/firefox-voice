package mozilla.voice.assistant

class IntentRunner {
    companion object {
        private val intents: MutableMap<String, Intent> = mutableMapOf()

        fun registerIntent(intent: Intent) {
            if (intents[intent.name] != null) {
                throw Error("Attempt to reregister intent: $intent.name")
            }
            intents[intent.name] = intent
            IntentParser.registerMatcher(intent.name, intent.match)
        }

        fun runUtterance(utterance: String) {
            // We are not porting nicknames or noPopup from the JS version.
            IntentParser.parse(utterance)?.let {
                intents[it.name]?.let { intent ->
                    intent.run(it)
                }
            }
        }
    }
}

class Intent(
    val name: String,
    val description: String,
    val examples: List<String>,
    val match: List<String>, // phrase templates
    val run: (MatcherResult) -> Unit
)
