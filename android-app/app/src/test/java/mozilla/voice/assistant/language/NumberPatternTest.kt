package mozilla.voice.assistant.language

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class NumberPatternTest {
    private val numberPattern = NumberPattern()
    private lateinit var language: Language

    @BeforeEach
    fun setup() {
        language = LanguageTest.getLanguage()
    }

    private fun expectMatch(s: String) {
        val results = numberPattern.matchUtterance(MatchResult(s, language))
        assertEquals(1, results.size, "$s was not recognized as a number")
    }

    private fun expectNoMatch(s: String) {
        val results = numberPattern.matchUtterance(MatchResult(s, language))
        assertEquals(0, results.size, "$s was unexpectedly recognized as a number")
    }

    @Test
    fun testMatches() {
        expectMatch("0")
        expectMatch("1")
        expectMatch("500")
    }

    @Test
    fun testExpectNoMatch() {
        listOf("x", "eight", "-5", "1.", "3.14", "+17").forEach { expectNoMatch(it) }
    }
}
