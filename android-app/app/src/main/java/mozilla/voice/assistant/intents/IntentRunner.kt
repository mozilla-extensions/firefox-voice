package mozilla.voice.assistant.intents

import android.content.Context
import mozilla.voice.assistant.intents.alarm.Alarm
import mozilla.voice.assistant.intents.launch.Launch
import mozilla.voice.assistant.intents.maps.Maps
import mozilla.voice.assistant.intents.music.Music
import mozilla.voice.assistant.language.Compiler
import mozilla.voice.assistant.language.Pattern
import mozilla.voice.assistant.language.PhraseSet

class IntentRunner(private val compiler: Compiler) {
    private val language = compiler.language
    private val metadata = compiler.metadata
    private val intents: MutableMap<String, Intent> = mutableMapOf()
    private val compiledPhrases: MutableList<Pattern> = mutableListOf()
    private val intentParser: IntentParser

    init {
        registerIntents(Alarm.getIntents())
        registerIntents(Launch.getIntents())
        registerIntents(Maps.getIntents())
        registerIntents(Music.getIntents())
        intentParser = IntentParser(
            PhraseSet(
                compiledPhrases,
                language
            )
        )
    }

    private fun registerIntents(pairs: List<Pair<String, IntentBuilder>>) {
        pairs.forEach { registerIntent(it.first, it.second) }
    }

    private fun registerIntent(intentName: String, createIntent: IntentBuilder) {
        if (intents[intentName] != null) {
            throw Error("Attempt to reregister intent: $intentName")
        }
        val parts = intentName.split('.')
        if (parts.size != 2) {
            throw Error("Intent $intentName should be named like X.Y")
        }
        val intent = Intent(
            intentName,
            description = metadata.getDescription(intentName),
            examples = metadata.getExamples(intentName),
            match = metadata.getPhrases(intentName),
            createIntent = createIntent
        )
        intents[intentName] = intent
        intent.match.forEach {
            compiledPhrases.add(compiler.compile(it, intentName = intent.name))
        }
    }

    internal fun runUtterance(
        utterance: String,
        context: Context? = null
    ): android.content.Intent? =
        // TODO: Add nicknames
        intentParser.parse(utterance)?.let {
            intents[it.name]?.createIntent?.invoke(it, context, metadata)
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
