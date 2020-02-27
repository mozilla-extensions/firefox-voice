package mozilla.voice.assistant.language
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class SlotTest {
    @Test
    fun testWordPattern() {
        val results = Slot(Word("hello"), "greeting").matchUtterance(makeMatch("hello"))
        assertEquals(1, results.size)
        val result = results[0]
        assertEquals(1, result.slots.size)
        assertEquals(1, result.slots["greeting"]?.size)
        assertEquals(Word("hello"), result.slots["greeting"]?.get(0))
        checkCounts(result, capturedWords = 1)
    }

    @Test
    fun testWildcardPattern() {
        val results = Slot(Wildcard(empty = false), "query").matchUtterance(makeMatch("one two three"))
        assertEquals(3, results.size)
        assertEquals(1, results.count { it.utteranceExhausted() })
        val slotValues = results.map { it.slots["query"]?.joinToString(separator = " ") { it.source } }
        assertTrue(slotValues.contains("one"))
        assertTrue(slotValues.contains("one two"))
        assertTrue(slotValues.contains("one two three"))
    }
}
