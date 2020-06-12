package mozilla.voice.assistant.language

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class PhoneNumberPatternTest {
    private val numberPattern = PhoneNumberPattern()
    private lateinit var language: Language

    @BeforeEach
    fun setup() {
        language = LanguageTest.getLanguage()
    }

    private fun expectMatch(s: String) {
        val results = numberPattern.matchUtterance(MatchResult(s, language))
        assertEquals(1, results.size, "$s was not recognized as a phone number")
    }

    private fun expectNoMatch(s: String) {
        val results = numberPattern.matchUtterance(MatchResult(s, language))
        assertEquals(
            0,
            results.size,
            "$s was unexpectedly recognized as a phone number"
        )
    }

    @Test
    fun testMatches() {
        listOf("415-555-1212", "555-1234").forEach { expectMatch(it) }
    }

    @Test
    fun testExpectNoMatch() {
        listOf("abc-def-ghij", "65-123-4567").forEach { expectNoMatch(it) }
    }
}
