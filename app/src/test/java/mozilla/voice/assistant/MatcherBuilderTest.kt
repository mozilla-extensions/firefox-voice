package mozilla.voice.assistant

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class MatcherBuilderTest {
    private fun testRegex(regex: Regex, phrase: String, vararg expected: String) {
        regex.matchEntire(phrase)?. run {
            assertEquals(expected.size + 1, groups.size)
            for (i in expected.indices) {
                assertEquals(expected[i], groupValues[i + 1])
            }
            return
        }
        throw AssertionError("Regex /$regex/ did not match: $phrase")
    }

    @Test
    fun testParameterRegexMatches() {
        listOf(
            listOf("[x=5]", "x", "5", ""),
            listOf("[foo=bar]baz", "foo", "bar", "baz"),
            listOf("[foo=bar][baz=3]", "foo", "bar", "[baz=3]")
        ).forEach {
            testRegex(MatcherBuilder.parameterRegex, it[0], it[1], it[2], it[3])
        }
    }

    @Test
    fun testParameterRegexMisses() {
        listOf("", "x=5", "[foo=bar").forEach {
            assertNull("Did not expect parameterRegex to match: $it",
                MatcherBuilder.parameterRegex.matchEntire(it))
        }
    }

    @Test
    fun testUntypedSlotRegexMatches() {
        listOf(
            listOf("[x]", "x", ""),
            listOf("[foo]bar", "foo", "bar"),
            listOf("[foo][bar]", "foo", "[bar]")
        ).forEach {
            testRegex(MatcherBuilder.untypedSlotRegex, it[0], it[1], it[2])
        }
    }

    @Test
    fun testUntypedSlotRegexMisses() {
        listOf("", "x=5", "[foo=bar", "[foo=bar]").forEach {
            assertNull("Did not expect untypedSlotRegex to match: $it",
                MatcherBuilder.untypedSlotRegex.matchEntire(it))
        }
    }

    @Test
    fun testTypedSlotRegexMatches() {
        listOf(
            listOf("[x:serviceName]more", "x", "serviceName", "more"),
            listOf("[mu:musicServiceName][more]", "mu", "musicServiceName", "[more]"),
            listOf("[language:lang]", "language", "lang", ""),
            listOf("[s:smallNumber][more:lang]", "s", "smallNumber", "[more:lang]")
        ).forEach {
            testRegex(MatcherBuilder.typedSlotRegex, it[0], it[1], it[2], it[3])
        }
    }

    @Test
    fun testTypedSlotRegexMisses() {
        listOf("", "x=5", "[foo=bar", "[foo=bar]").forEach {
            assertNull("Did not expect typedSlotRegex to match: $it",
                MatcherBuilder.typedSlotRegex.matchEntire(it))
        }
    }

    @Test
    fun testAlternativesRegexMatches() {
        listOf(
            listOf("(foo|bar|baz)not this part", "foo|bar|baz", "not this part"),
            listOf("(12 57 91))", "12 57 91", ")")
        ).forEach {
            testRegex(MatcherBuilder.alternativesRegex, it[0], it[1], it[2])
        }
    }

    @Test
    fun testAlternativesRegexMisses() {
        listOf("", "x=5", "[foo=bar", "[foo=bar]", "(foo", "(foo(31").forEach {
            assertNull("Did not expect alternativesRegex to match: $it",
                MatcherBuilder.alternativesRegex.matchEntire(it))
        }
    }

    @Test
    fun testWordsRegexMatches() {
        listOf(
            listOf("hello(foo)", "hello", "(foo)"),
            listOf("1 | 2 | 3 [now]", "1 | 2 | 3 ", "[now]")
        ).forEach {
            testRegex(MatcherBuilder.wordsRegex, it[0], it[1], it[2])
        }
    }

    @Test
    fun testWordsRegexMisses() {
        listOf("", "(hi", "((hi))", "[", "(").forEach {
            assertNull("Did not expect wordsRegex to match: $it",
                MatcherBuilder.wordsRegex.matchEntire(it))
        }
    }
}
