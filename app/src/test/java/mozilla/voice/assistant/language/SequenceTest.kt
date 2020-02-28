package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class SequenceTest {
    @Test
    fun testWordSequence() {
        val sequence = Sequence(
            listOf(
                Word("one"),
                Word("two"),
                Word("three")
            )
        )
        val results = sequence.matchUtterance(makeMatch("one two three"))
        checkCounts(results[0], capturedWords = 3)
    }

    @Test
    fun testWildcardSequence1() {
        val sequence = Sequence(
            listOf(
                Wildcard(empty = true),
                Word("hello")
            )
        )
        val results = sequence.matchUtterance(makeMatch("hello"))
        assertEquals(1, results.size)
        checkCounts(results[0], capturedWords = 1)
    }

    @Test
    fun testWildcardSequence2() {
        val sequence = Sequence(
            listOf(
                Wildcard(empty = false),
                Word("hello")
            )
        )
        val results = sequence.matchUtterance(makeMatch("hello"))
        assertEquals(0, results.size)
    }

    @Test
    fun testWildcardSequence3() {
        Language.clear()
        Language.addStopwords("the")
        val sequence = Sequence(
            listOf(
                Wildcard(empty = true),
                Word("hello")
            )
        )
        val results = sequence.matchUtterance(makeMatch("the hello"))
        // There are two possible matches:
        // match1: Wildcard matches "the" and Word matches "hello"
        // match2: Wildcard matches empty string and Word discards stop word "the" and matches "hello"
        assertEquals(2, results.size)
        checkCounts(results.getOnly() { it.skippedWords == 0 }, capturedWords = 1)
        checkCounts(results.getOnly() { it.skippedWords != 0 }, capturedWords = 1, skippedWords = 1)
    }
}
