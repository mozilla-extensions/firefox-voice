package mozilla.voice.assistant.language

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class SequenceTest {
    private lateinit var language: Language

    @BeforeEach
    fun setup() {
        language = LanguageTest.getLanguage(stopwords = "the")
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
