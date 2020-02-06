package mozilla.voice.assistant

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class MatcherTest {
    private fun testMatcher(
        matcher: Matcher,
        utterance: String,
        shouldSucceed: Boolean = true,
        slots: Map<String, String> = emptyMap(),
        slotTypes: Map<String, String> = emptyMap(),
        parameters: Map<String, String> = emptyMap()
    ) {
        matcher.match(utterance)?. let { result ->
            assertTrue(
                "Regex /${matcher.regexString}/ unexpectedly matched '$utterance'",
                        shouldSucceed
            )

            assertEquals(utterance, result.utterance)
            assertEquals(slots, result.slots)
            assertEquals(slotTypes, result.slotTypes)
            assertEquals(parameters, result.parameters)
        } ?: if (shouldSucceed) fail("Regex /${matcher.regexString}/ should have matched '$utterance'")
    }

    @Test
    fun testSimpleMatcher() {
        MatcherBuilder("hello world").build()?. let {
            testMatcher(it, "hello world")
            testMatcher(it, "goodbye world", shouldSucceed = false)
        } ?: fail("Unable to build matcher")
    }

    @Test
    fun testConjunctionMatcher() {
        MatcherBuilder("(hello world | goodbye)").build()?. let {
            testMatcher(it, "hello world")
            testMatcher(it, "goodbye")
            testMatcher(it, "hello world goodbye", shouldSucceed = false)
        } ?: fail("Unable to build matcher")
    }

    @Test
    fun testUntypedSlotMatcher() {
        MatcherBuilder("feed me some [food] please").build()?. let {
            testMatcher(
                it,
                "feed me some chocolate please",
                slots = mapOf("food" to "chocolate")
            )
            testMatcher(
                it,
                "feed me some cat food please",
                slots = mapOf("food" to "cat food")
            )
            testMatcher(
                it,
                "feed me some candy",
                shouldSucceed = false
            )
        } ?: fail("Unable to build matcher")
    }

    @Test
    fun typedSlotMatcher() {
        MatcherBuilder("I can count to [x:smallNumber]").build()?.let {
            testMatcher(
                it,
                "I can count to 5",
                slots = mapOf("x" to "5"),
                slotTypes = mapOf("x" to "smallNumber")
            )
        } ?: fail("Unable to build matcher")
    }

    @Test
    fun testParameterMatcher() {
        MatcherBuilder("go to mars [planet=4]").build()?. let {
            testMatcher(
                it,
                "go to mars",
                parameters = mapOf("planet" to "4")
            )
        } ?: fail("Unable to build matcher")
    }
}
