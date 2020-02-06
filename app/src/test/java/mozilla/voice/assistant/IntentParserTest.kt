package mozilla.voice.assistant

import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class IntentParserTest {
    @Test
    fun testNormalizeTextSquashesSpaces() {
        assertEquals("foo bar", IntentParser.normalizeText("foo   bar"))
    }

    @Test
    fun testNormalizeTextTrimsStrings() {
        assertEquals("foo bar", IntentParser.normalizeText("   foo bar "))
    }

    @Test
    fun testNormalizeTextRemovesTrailingPunctuation() {
        assertEquals("foo bar", IntentParser.normalizeText("foo? bar!"))
        assertEquals("foo bar baz", IntentParser.normalizeText("foo, bar. baz;"))
        assertEquals("foo bar", IntentParser.normalizeText("foo... bar!?!"))
    }

    @Test
    fun testNormalizeDoesNotRemoveLeadingPunctuation() {
        assertEquals("?foo !bar", IntentParser.normalizeText("?foo? !bar!"))
    }

    @Test
    fun testNormalizeDoesNotRemovePunctuationInWords() {
        assertEquals("foo.bar ba,z", IntentParser.normalizeText("foo.bar ba,z"))
        assertEquals("www.mozilla.org", IntentParser.normalizeText("www.mozilla.org"))
    }

    @Test
    fun testNormalizeCombinations() {
        assertEquals("www.mozilla.org", IntentParser.normalizeText("  www.mozilla.org!!"))
    }

    @Test
    fun testCreateSubRegex() { // return value of createSubRegex() is cached in companion object
        assertEquals("X world", "the world".replace(sub_regex, "X"))
        assertEquals("don't X X cat", "don't tap the cat".replace(sub_regex, "X"))
        assertEquals("Y and onward", "up word and onward".replace(sub_regex, "Y"))
    }

    @Test
    fun testCreateSubRegexes() {
        substitutions.forEach { substitution ->
            val entry = sub_regexes[substitution.key]
            if (entry == null) {
                fail("Could not find entry for '$substitution'")
            } else {
                assertEquals(substitution.value, entry.second)
                assertEquals(substitution.value, substitution.key.replace(entry.first, entry.second))
            }
        }
    }

    private fun findAlternatives(text: String) = IntentParser.findAlternatives(
        text,
        substitutions,
        sub_regex,
        sub_regexes)

    @Test
    fun testFindAlternatives1() {
        val alternatives = findAlternatives("tap the cat")
        val expectedAlternatives = listOf(
            Alternative("tap the cat", 0),
            // Replace just "tap" with "tab" (no change in length, 1 substitution)
            Alternative("tab the cat", -1),
            // Replace just "the" with "" (-3 in length, 1 substitution)
            Alternative("tap cat", -3 - 1),
            // Make all replacements (-3 in length, 2 substitutions)
            Alternative("tab cat", -3 - 2)
        )
        expectedAlternatives.forEach {
            assertTrue("Alternatives did not contain $it but did contain $alternatives", alternatives.contains(it))
        }
        assertEquals(4, alternatives.size)
    }

    @Test
    fun testFindAlternatives2() {
        val alternatives = findAlternatives("tap tap tap up word")
        val expectedAlternatives = listOf(
            Alternative("tap tap tap up word", 0),
            // Replace all 3 taps (no change in length, 3 substitutions)
            Alternative("tab tab tab up word", -3),
            // Replace "up word" with "upward" (-1 in length, 1 substitution)
            Alternative("tap tap tap upward", -1 - 1),
            // Make both types of replacement (-1 in length, 4 substitutions)
            Alternative("tab tab tab upward", -1 - 4)
        )
        expectedAlternatives.forEach {
            assertTrue("Alternatives did not contain $it but did contain $alternatives", alternatives.contains(it))
        }
        assertEquals(4, alternatives.size)
    }

    companion object {
        private val substitutions = mapOf(
            "the" to "",
            "tap" to "tab",
            "up word" to "upward"
        )

        private val sub_regexes: Map<String, Pair<Regex, String>> = IntentParser.createSubRegexes(substitutions)
        private val sub_regex: Regex = IntentParser.createSubRegex(substitutions)
    }
}