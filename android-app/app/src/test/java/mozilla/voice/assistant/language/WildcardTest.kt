package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class WildcardTest {
    private lateinit var language: Language

    @Before
    fun setup() {
        language = LanguageTest.getLanguage()
    }

    @Test
    fun testEmptyWildcardMatchesEmptyString() {
        val results = Wildcard(empty = true).matchUtterance(makeMatch("", language))
        assertEquals(1, results.size)
        assertTrue(results[0].utteranceExhausted())
    }

    @Test
    fun testNonEmptyWildcardDoesNotMatchEmptyString() {
        val results = Wildcard(empty = false).matchUtterance(makeMatch("", language))
        assertEquals(0, results.size)
    }

    @Test
    fun testEmptyWildcardMatchesNonEmptyString() {
        val results = Wildcard(empty = true).matchUtterance(makeMatch("one", language))
        assertEquals(2, results.size)
        assertEquals(1, results.filter { it.utteranceExhausted() }.size)
        val consumed = results.filter { it.utteranceExhausted() }[0]
        checkCounts(consumed) // all counts should be 0
        assertEquals(1, results.filterNot { it.utteranceExhausted() }.size)
    }

    @Test
    fun testNonEmptyWildcardMatchesNonEmptyString() {
        val results = Wildcard(empty = false).matchUtterance(makeMatch("one", language))
        assertEquals(1, results.size)
        checkCounts(results[0]) // all counts should be 0
    }
}
