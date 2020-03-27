package mozilla.voice.assistant.language

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class WordTest {
    private lateinit var language: Language

    @BeforeEach
    fun setAliases() {
        language = LanguageTest.getLanguage("the")
        language.addAlias("ello=hello") // "ello" is an alias for "hello"
        language.addAlias("\"hell oh\" = hello") // "hell oh" is an alias for "hello"
    }

    @Test
    fun testNormalize() {
        assertEquals("foo", "foo".normalize())
        assertEquals("world", "world!!!".normalize())
    }

    private fun checkSingleMatch(word: String, utterance: String, aliasedWords: Int = 0, capturedWords: Int = 0, skippedWords: Int = 0) {
        val results = Word(word, language).matchUtterance(makeMatch(utterance, language))
        assertEquals(1, results.size, "expected a single result: $results")
        checkCounts(results[0], aliasedWords = aliasedWords, capturedWords = capturedWords, skippedWords = skippedWords)
    }

    @Test
    fun testWordMatchesItself() {
        checkSingleMatch("hello", "hello", capturedWords = 1)
    }

    @Test
    fun testStopwordSkipped() {
        checkSingleMatch("hello", "the hello", capturedWords = 1, skippedWords = 1)
    }

    @Test
    fun testAlias() {
        checkSingleMatch("hello", "ello", aliasedWords = 1, capturedWords = 1)
    }

    @Test
    fun testMultiwordAlias() {
        checkSingleMatch("hello", "hell oh", aliasedWords = 2, capturedWords = 2)
    }

    @Test
    fun testCombination() {
        checkSingleMatch(
            "hello",
            "the the the hell oh",
            aliasedWords = 2,
            skippedWords = 3,
            capturedWords = 2
        )
    }
}
