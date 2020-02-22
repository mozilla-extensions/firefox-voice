package mozilla.voice.assistant

import mozilla.voice.assistant.intents.maps.Maps
import org.junit.Assert.assertEquals
import org.junit.Assert.fail
import org.junit.BeforeClass
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class MapsTest {
    private fun testMapHelper(
        utterance: String,
        expectedThing: String? = null,
        expectedLocation: String? = null
    ) {
        IntentParser.getBestMatch(utterance)?.let { mr: MatcherResult ->
            expectedThing?.let { assertEquals(it, mr.slots[Maps.THING_KEY]) }
            expectedLocation?.let { assertEquals(it, mr.slots[Maps.LOCATION_KEY]) }
        } ?: fail("Did not parse as map request: $utterance")
    }

    @Test
    fun testLocationMatches() {
        listOf(
            Pair("tell me how to get to LOC", "sesame street"),
            Pair("i'd like driving directions to LOC", "mills college"),
            Pair("navigate to LOC", "mozilla hq")
        ).map {
            testMapHelper(it.first.replace("LOC", it.second), expectedLocation = it.second)
        }
    }

    companion object {
        @BeforeClass
        @JvmStatic
        fun setup() {
            Maps.register()
        }
    }
}
