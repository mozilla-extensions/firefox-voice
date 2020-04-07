package mozilla.voice.assistant.intents

import android.content.Context
import android.content.Intent
import android.content.pm.ActivityInfo
import android.provider.MediaStore
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkConstructor
import mozilla.voice.assistant.language.Compiler
import mozilla.voice.assistant.language.LanguageTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class IntentRunnerTest {
    private lateinit var intentRunner: IntentRunner
    private lateinit var context: Context

    @BeforeEach
    fun setup() {
        val language = LanguageTest.getLanguage()
        intentRunner = IntentRunner(
            Compiler(MetadataTest.getMetadata(language, TOML_FILE), language),
            listOf(
                Pair(
                    "music.play",
                    ::dummyIntentBuilder
                )
            )
        )
        context = mockk<Context>(relaxed = true)
    }

    @Test
    fun testDetermineBestIntentFindsMatch() {
        listOf(
            listOf("play misty for me"),
            listOf("pay the piper", "play misty for me")
        ).forEach {
            val pair = intentRunner.determineBestIntent(context, it)
            assertEquals("play misty for me", pair.first)
            assertEquals(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH, pair.second.action)
            assertEquals("misty", pair.second.getStringExtra(SONG_KEY))
            assertEquals("me", pair.second.getStringExtra(LISTENER_KEY))
        }
    }

    @Test
    fun testDetermineBestIntentFallsBack() {
        mockkConstructor(Intent::class)
        listOf(
            listOf("pay misty for me"),
            listOf("pay the piper for me", "pay that")
        ).forEach {
            val pair = intentRunner.determineBestIntent(context, it)
            assertEquals(it.first(), pair.first)
            // We can't test the returned fallback intent, since the Intent constructor returns
            // null in tests, and we can't mock constructors taking parameters using MockK.
            // https://stackoverflow.com/questions/53902932
        }
    }

    companion object {
        private const val SONG_KEY = "song"
        private const val LISTENER_KEY = "listener"
        private const val QQQ = "\"\"\""
        private val TOML_FILE = """
            [music.play]
            description = "Play music"
            match = $QQQ
                play [song] for [listener]
                play [song]
            $QQQ

            [[music.play.example]]
            phrase = "Play 'Yellow Submarine' for me"

            [[music.play.example]]
            phrase = "Play nyancat for Julia"
        """.trimIndent()

        private fun dummyIntentBuilder(
            parseResult: ParseResult,
            context: Context?,
            metadata: Metadata
        ): Intent? {
            val intent = mockk<Intent>(relaxed = true)
            val activityInfo = mockk<ActivityInfo>(relaxed = true)
            activityInfo.exported = true
            every { intent.action } returns MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH
            every { intent.resolveActivityInfo(any(), any()) } returns activityInfo
            every { intent.getStringExtra(SONG_KEY) } returns parseResult.slots[SONG_KEY]
            every { intent.getStringExtra(LISTENER_KEY) } returns parseResult.slots[LISTENER_KEY]
            return intent
        }
    }
}
