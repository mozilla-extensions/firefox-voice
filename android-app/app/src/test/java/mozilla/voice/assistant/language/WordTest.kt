package mozilla.voice.assistant.language

import org.junit.Assert
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class WordTest {
    private lateinit var language: Language

    @Before
    fun setAliases() {
        language = LanguageTest.getLanguage()
        language.addStopwords("the")
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
        Assert.assertEquals("expected a single result: $results", 1, results.size)
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
