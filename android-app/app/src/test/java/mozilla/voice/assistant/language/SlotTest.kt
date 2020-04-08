package mozilla.voice.assistant.language

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class SlotTest {
    private lateinit var language: Language

    @BeforeEach
    fun setup() {
        language = LanguageTest.getLanguage()
    }

    @Test
    fun testWordPattern() {
        val language = LanguageTest.getLanguage()
        val results = Slot(Word("hello", language), "greeting").matchUtterance(makeMatch("hello", language))
        assertEquals(1, results.size)
        val result = results[0]
        assertEquals(1, result.slots.size)
        assertEquals(1, result.slots["greeting"]?.size)
        assertEquals(Word("hello", language), result.slots["greeting"]?.get(0))
        checkCounts(result, capturedWords = 1)
    }

    @Test
    fun testWildcardPattern() {
        val results = Slot(Wildcard(empty = false), "query").matchUtterance(makeMatch("one two three", language))
        assertEquals(3, results.size)
        assertEquals(1, results.count { it.utteranceExhausted() })
        val slotValues = results.map { it.slots["query"]?.joinToString(separator = " ") { it.toSource() } }
        assertTrue(slotValues.contains("one"))
        assertTrue(slotValues.contains("one two"))
        assertTrue(slotValues.contains("one two three"))
    }
}
