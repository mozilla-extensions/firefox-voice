package mozilla.voice.assistant

import android.content.Context

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

        fun processUtterance(utterance: String, context: Context? = null): android.content.Intent? =
            // We are not porting nicknames or noPopup from the JS version.
            IntentParser.parse(utterance)?.let {
                intents[it.name]?.let { intent ->
                    return intent.createIntent(it)
                }
            }
    }
}

class Intent(
    val name: String,
    val description: String,
    val examples: List<String>,
    val match: List<String>, // phrase templates
    val createIntent: (MatcherResult) -> android.content.Intent?
)
