package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class FullPhraseTest {
    @Test
    fun testPhraseWithoutStopwords() {
        val results = FullPhrase("hello world".toWordList()).matchUtterance(makeMatch("hello world"))
        assertEquals(1, results.size)
        checkCounts(results[0], capturedWords = 2)
    }

    @Test
    fun testPhraseWithTrailingStopwords() {
        English.clear()
        English.addStopword("the")
        val results = FullPhrase("hello world".toWordList()).matchUtterance(makeMatch("hello world the"))
        assertEquals(1, results.size)
        checkCounts(results[0], capturedWords = 2, skippedWords = 1)
    }
}
