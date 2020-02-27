package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class WildcardTest {
    @Test
    fun testEmptyWildcardMatchesEmptyString() {
        val results = Wildcard(empty = true).matchUtterance(makeMatch(""))
        assertEquals(1, results.size)
        assertTrue(results[0].utteranceExhausted())
    }

    @Test
    fun testNonEmptyWildcardDoesNotMatchEmptyString() {
        val results = Wildcard(empty = false).matchUtterance(makeMatch(""))
        assertEquals(0, results.size)
    }

    @Test
    fun testEmptyWildcardMatchesNonEmptyString() {
        val results = Wildcard(empty = true).matchUtterance(makeMatch("one"))
        assertEquals(2, results.size)
        assertEquals(1, results.filter { it.utteranceExhausted() }.size)
        val consumed = results.filter { it.utteranceExhausted() }[0]
        checkCounts(consumed) // all counts should be 0
        assertEquals(1, results.filterNot { it.utteranceExhausted() }.size)
    }

    @Test
    fun testNonEmptyWildcardMatchesNonEmptyString() {
        val results = Wildcard(empty = false).matchUtterance(makeMatch("one"))
        assertEquals(1, results.size)
        checkCounts(results[0]) // all counts should be 0
    }
}
