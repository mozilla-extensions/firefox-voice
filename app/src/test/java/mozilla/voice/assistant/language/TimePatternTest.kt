package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class TimePatternTest {
    private val timePattern = TimePattern()
    private lateinit var language: Language

    @Before
    fun setup() {
        language = LanguageTest.getLanguage()
    }

    private fun expectMatch(s: String, expectedHours: Int = 0, expectedMinutes: Int = 0) {
        val results = timePattern.matchUtterance(MatchResult(s, language))
        assertFalse("Expected time $s to be matched by TimePattern", results.isEmpty())
        assertEquals("Expected a single MatchResult for $s", 1, results.size)
        val time = TimePattern.extractTime(s)
        assertNotNull("TimePattern.extractTime(\"$s\") failed", time)
        assertEquals("Unexpected hour extracted from $s", expectedHours, time?.first)
        assertEquals("Unexpected minutes extracted from $s", expectedMinutes, time?.second)
    }

    private fun expectNoMatch(s: String) {
        assertTrue(timePattern.matchUtterance(MatchResult(s, language)).isEmpty())
    }

    @Test
    fun testMatches() {
        expectMatch("1:30", 1, 30)
        expectMatch("7:17", 7, 17)
        expectMatch("23:59", expectedHours = 23, expectedMinutes = 59)
    }

    @Test
    fun testNonMatches() {
        listOf("130", "0", "24:00", "3:60").forEach { expectNoMatch(it) }
    }
}
