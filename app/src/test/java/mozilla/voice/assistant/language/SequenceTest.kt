package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class SequenceTest {
    private lateinit var language: Language

    @Before
    fun setup() {
        language = LanguageTest.getLanguage()
    }

    @Test
    fun testWordSequence() {
        val sequence = Sequence("one two three".toWordList(language))
        val results = sequence.matchUtterance(makeMatch("one two three", language))
        checkCounts(results[0], capturedWords = 3)
    }

    @Test
    fun testWildcardSequence1() {
        val sequence = Sequence(
            listOf(
                Wildcard(empty = true),
                Word("hello", language)
            )
        )
        val results = sequence.matchUtterance(makeMatch("hello", language))
        assertEquals(1, results.size)
        checkCounts(results[0], capturedWords = 1)
    }

    @Test
    fun testWildcardSequence2() {
        val sequence = Sequence(
            listOf(
                Wildcard(empty = false),
                Word("hello", language)
            )
        )
        val results = sequence.matchUtterance(makeMatch("hello", language))
        assertEquals(0, results.size)
    }

    @Test
    fun testWildcardSequence3() {
        language.addStopwords("the")
        val sequence = Sequence(
            listOf(
                Wildcard(empty = true),
                Word("hello", language)
            )
        )
        val results = sequence.matchUtterance(makeMatch("the hello", language))
        // There are two possible matches:
        // match1: Wildcard matches "the" and Word matches "hello"
        // match2: Wildcard matches empty string and Word discards stop word "the" and matches "hello"
        assertEquals(2, results.size)
        checkCounts(results.getOnly() { it.skippedWords == 0 }, capturedWords = 1)
        checkCounts(results.getOnly() { it.skippedWords != 0 }, capturedWords = 1, skippedWords = 1)
    }
}
