package mozilla.voice.assistant

import android.content.Context

class IntentRunner {
    companion object {
        private val intents: MutableMap<String, Intent> = mutableMapOf()

        internal fun registerIntent(intentName: String, createIntent: (ParseResult, Context?) -> android.content.Intent) {
            if (intents[intentName] != null) {
                throw Error("Attempt to reregister intent: $intentName")
            }
            val parts = intentName.split('.')
            if (parts.size != 2) {
                throw Error("Intent $intentName should be named like X.Y")
            }
            val intent = Intent(
                intentName,
                description = Metadata.getDescription(intentName),
                examples = Metadata.getExamples(intentName),
                match = Metadata.getPhrases(intentName),
                createIntent = createIntent
            )
            intents[intentName] = intent
            IntentParser.registerMatcher(intent.name, intent.match)
        }

        internal fun runUtterance(utterance: String, context: Context): android.content.Intent? =
            // TODO: Add nicknames
            IntentParser.parse(utterance)?.let {
                intents[it.name]?.createIntent?.invoke(it, context)
            }
    }
}

class Intent(
    internal val name: String,
    internal val description: String,
    internal val examples: List<String>,
    internal val match: List<String>,
    internal val createIntent: (ParseResult, Context?) -> android.content.Intent?
)
