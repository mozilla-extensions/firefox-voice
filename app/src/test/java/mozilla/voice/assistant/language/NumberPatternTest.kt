package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class NumberPatternTest {
    private val numberPattern = NumberPattern()
    private lateinit var language: Language

    @Before
    fun setup() {
        language = LanguageTest.getLanguage()
    }

    private fun expectMatch(s: String) {
        val results = numberPattern.matchUtterance(MatchResult(s, language))
        assertEquals("$s was not recognized as a number", 1, results.size)
    }

    private fun expectNoMatch(s: String) {
        val results = numberPattern.matchUtterance(MatchResult(s, language))
        assertEquals("$s was unexpectedly recognized as a number", 0, results.size)
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
