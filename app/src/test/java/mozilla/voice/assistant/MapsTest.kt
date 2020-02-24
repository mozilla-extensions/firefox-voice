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
        expectedLocation: String? = null,
        expectedMode: String? = null
    ) {
        IntentParser.getBestMatch(utterance)?.let { mr: MatcherResult ->
            expectedThing?.let { assertEquals(
                "incorrect thing for: $utterance",
                it,
                mr.slots[Maps.THING_KEY]
            ) }
            expectedLocation?.let { assertEquals(
                "incorrect location for: $utterance",
                it,
                mr.slots[Maps.LOCATION_KEY]
            ) }
            expectedMode?.let { assertEquals(
                "incorrect mode for: $utterance",
                it,
                mr.parameters[Maps.MODE_KEY]
            ) }
            true // to keep from triggering below Elvis operator
        } ?: fail("Did not parse as map request: $utterance")
    }

    @Test
    fun testLocationMatches() {
        listOf(
            Pair("tell me how to get to LOC", "sesame street"),
            Pair("show me directions to LOC", "berkeley"),
            Pair("i'd like driving directions to LOC", "mills college"),
            Pair("give me directions to LOC", "dairy queen"),
            Pair("navigate to LOC", "mozilla hq"),
            Pair("navigate by car to LOC", "chinatown"),
            Pair("what's the best way to get to LOC", "the bay bridge"),
            Pair("what's the quickest way to drive to LOC", "seattle")
        ).map {
            testMapHelper(
                it.first.replace("LOC", it.second),
                expectedLocation = it.second)
        }
    }

    @Test
    fun testLocationBikeMatches() {
        val loc = "mozilla hq"
        listOf(
            "tell me how to bike to $loc",
            "show how to bicycle to $loc",
            "show how to get to $loc by bike",
            "show how to cycle to $loc",
            "what's the quickest way to bike to $loc"
        ).map {
            testMapHelper(it, expectedMode = Maps.BIKE_MODE)
        }
    }

    @Test
    fun testLocationWalkingMatches() {
        val loc = "mozilla hq"
        listOf(
            "tell me how to walk to $loc",
            "show how to get to $loc on foot",
            "show how to get to $loc by foot",
            "show me how to get to $loc on foot",
            "show me how to get to $loc by foot",
            "show how to get to $loc by walking",
            "what's the quickest way to walk to $loc"
        ).map {
            testMapHelper(it, expectedMode = Maps.WALK_MODE)
        }
    }

    @Test
    fun testRecommendThingMatches() {
        val thing = "froyo"
        listOf(
            "where to find $thing",
            "where's the nearest $thing",
            "where's the nearest place for $thing",
            "find nearby $thing"
        ).map {
            testMapHelper(
                it,
                expectedThing = thing
            )
        }
    }

    @Test
    fun testRecommendThingLocMatches() {
        val thing = "soft serve ice cream"
        listOf(
            Pair("where can i buy $thing in LOC", "the mission"),
            Pair("what's a good place for $thing near LOC", "the bay bridge"),
            Pair("search for $thing in LOC", "san francisco")
        ).map { pair ->
            testMapHelper(
                pair.first.replace("LOC", pair.second),
                expectedThing = thing,
                expectedLocation = pair.second
            )
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
