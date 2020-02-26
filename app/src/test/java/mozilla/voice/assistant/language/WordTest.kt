package mozilla.voice.assistant.language

import org.junit.Assert
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class WordTest {
    @Before
    fun setAliases() {
        English.clear()
        // TODO: Figure out why tests fail if I put these in the @BeforeClass method and
        // remove the above call to English.clear().
        English.addStopword("the")
        English.addAlias("hello ello") // "ello" is an alias for "hello"
        English.addAlias("hello hell oh") // "hell oh" is an alias for "hello"
    }


    internal fun checkSingleMatch(word: String, utterance: String, aliasedWords: Int = 0, capturedWords: Int = 0, skippedWords: Int = 0) {
        val results = Word(word).matchUtterance(makeMatch(utterance))
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
