package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class FullPhraseTest {
    lateinit var language: Language

    @Before
    fun setup() {
        language = LanguageTest.getLanguage()
    }

    @Test
    fun testPhraseWithoutStopwords() {
        val results =
            FullPhrase(Sequence("hello world".toWordList(language))).matchUtterance(
                makeMatch("hello world", language)
            )
        assertEquals(1, results.size)
        checkCounts(results[0], capturedWords = 2)
    }

    @Test
    fun testPhraseWithTrailingStopwords() {
        language.addStopwords("the")
        val results =
            FullPhrase(Sequence("hello world".toWordList(language))).matchUtterance(
                makeMatch("hello world the", language)
            )
        assertEquals(1, results.size)
        checkCounts(results[0], capturedWords = 2, skippedWords = 1)
    }
}
