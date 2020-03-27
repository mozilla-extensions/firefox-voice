package mozilla.voice.assistant.language

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class TimePatternTest {
    private val timePattern = TimePattern()
    private lateinit var language: Language

    @BeforeEach
    fun setup() {
        language = LanguageTest.getLanguage()
    }

    private fun expectMatch(s: String, expectedHours: Int = 0, expectedMinutes: Int = 0) {
        val results = timePattern.matchUtterance(MatchResult(s, language))
        assertFalse(results.isEmpty(), "Expected time $s to be matched by TimePattern")
        assertEquals(1, results.size, "Expected a single MatchResult for $s")
        val time = TimePattern.extractTime(s)
        assertNotNull(time, "TimePattern.extractTime(\"$s\") failed")
        assertEquals(expectedHours, time?.first, "Unexpected hour extracted from $s")
        assertEquals(expectedMinutes, time?.second, "Unexpected minutes extracted from $s")
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
