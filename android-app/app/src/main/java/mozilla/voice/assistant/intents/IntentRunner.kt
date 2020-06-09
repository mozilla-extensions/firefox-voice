package mozilla.voice.assistant.intents

import android.content.Context
import androidx.annotation.VisibleForTesting
import mozilla.voice.assistant.language.Compiler
import mozilla.voice.assistant.language.Pattern
import mozilla.voice.assistant.language.PhraseSet

class IntentRunner(private val compiler: Compiler, intentBuilders: List<Pair<String, IntentBuilder>>) {
    private val language = compiler.language
    private val metadata = compiler.metadata
    private val intents: MutableMap<String, Intent> = mutableMapOf()
    private val intentParser: IntentParser

    init {
        intentParser = IntentParser(
            PhraseSet(
                registerIntents(intentBuilders),
                language
            )
        )
    }

    private fun registerIntents(pairs: List<Pair<String, IntentBuilder>>) =
        pairs.flatMap { registerIntent(it.first, it.second) }

    private fun registerIntent(intentName: String, createIntent: IntentBuilder): List<Pattern> {
        if (intents[intentName] != null) {
            throw IllegalArgumentException("Attempt to reregister intent: $intentName")
        }
        val parts = intentName.split('.')
        if (parts.size != 2) {
            throw IllegalArgumentException("Intent $intentName should be named like X.Y")
        }
        val intent = Intent(
            intentName,
            description = metadata.getDescription(intentName),
            examples = metadata.getExamples(intentName),
            match = metadata.getPhrases(intentName),
            createIntent = createIntent
        )
        intents[intentName] = intent
        return intent.match.map {
            compiler.compile(it, intentName = intent.name)
        }
    }

    private fun runUtterance(
        utterance: String,
        context: Context? = null
    ): android.content.Intent? =
        intentParser.parse(utterance)?.let {
            intents[it.name]?.createIntent?.invoke(it, context, metadata)
        }

    private fun getIntent(context: Context, utterance: String): android.content.Intent? =
        runUtterance(utterance, context)?.let { intent ->
            intent.resolveActivityInfo(context.packageManager, intent.flags)?.let { activityInfo ->
                if (activityInfo.packageName == "mozilla.voice.assistant" || activityInfo.exported) intent else null
            }
        }

    // returns a pair consisting of the first utterance to yield an Intent and the intent
    internal fun determineBestIntent(
        context: Context,
        utterances: List<String>
    ): Pair<String, android.content.Intent> =
        utterances.mapNotNull { utterance ->
            getIntent(context, utterance)?.let { intent ->
                Pair(utterance, intent)
            }
        }.firstOrNull() ?: Pair(
            utterances[0],
            android.content.Intent(
                FALLBACK_ACTION
            ).apply {
                putExtra("query", utterances[0])
            })

    /**
     * Gets a list of up to [n] example phrases from registered intents.
     * This will choose no more than one phrase for each intent.
     *
     * @param n the maximum number of phrases to return
     * @return up to [n] example phrases, each for a different intent
     */
    fun getExamplePhrases(n: Int): List<String> =
        intents.values.shuffled().take(n).map { it.examples.random() }

    companion object {
        @VisibleForTesting
        internal val FALLBACK_ACTION = android.content.Intent.ACTION_WEB_SEARCH
    }
}

class Intent(
    internal val name: String,
    internal val description: String,
    internal val examples: List<String>,
    internal val match: List<String>,
    internal val createIntent: IntentBuilder
)

typealias IntentBuilder = (ParseResult, Context?, Metadata) -> android.content.Intent?
