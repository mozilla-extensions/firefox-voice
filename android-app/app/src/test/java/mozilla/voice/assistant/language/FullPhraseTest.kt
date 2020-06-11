package mozilla.voice.assistant.language

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class FullPhraseTest {
    lateinit var language: Language

    @BeforeEach
    fun setup() {
        language = LanguageTest.getLanguage(stopwords = "the")
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
        val results =
            FullPhrase(Sequence("hello world".toWordList(language))).matchUtterance(
                makeMatch("hello world the", language)
            )
        assertEquals(1, results.size)
        checkCounts(results[0], capturedWords = 2, skippedWords = 1)
    }
}
