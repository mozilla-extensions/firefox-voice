package mozilla.voice.assistant

import android.provider.AlarmClock
import mozilla.voice.assistant.intents.alarm.Alarm
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.BeforeClass
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class AlarmTest {
    // TODO: Mock or pass Calendar instance.
    private fun testAbsoluteHelper(time: String, hour: Int, min: Int) {
        val utterance = "set alarm for $time"
        IntentRunner.processUtterance(utterance)?.let {
            assertEquals(AlarmClock.ACTION_SET_ALARM, it.action)
            assertTrue(it.hasExtra(AlarmClock.EXTRA_HOUR))
            assertEquals(hour, it.getIntExtra(AlarmClock.EXTRA_HOUR, UNUSED_DEFAULT))
            assertTrue(it.hasExtra(AlarmClock.EXTRA_MINUTES))
            assertEquals(min, it.getIntExtra(AlarmClock.EXTRA_MINUTES, UNUSED_DEFAULT))
        } ?: fail("Did not parse as alarm request: $utterance")
    }

    @Test
    fun testMidnight() {
        testAbsoluteHelper("midnight", 0, 0)
        testAbsoluteHelper("12 midnight", 0, 0)
    }

    @Test
    fun testNoon() {
        testAbsoluteHelper("noon", 12, 0)
        testAbsoluteHelper("12 noon", 12, 0)
    }

    @Test
    fun testNoPeriod() {
        testAbsoluteHelper("6", 6, 0)
        testAbsoluteHelper("13", 13, 0)
        testAbsoluteHelper("5:15", 5, 15)
    }

    @Test
    fun testAM() {
        testAbsoluteHelper("3 a.m.", 3, 0)
        testAbsoluteHelper("11 a.m.", 11, 0)
        testAbsoluteHelper("11:30 a.m.", 11, 30)
    }

    @Test
    fun testPM() {
        testAbsoluteHelper("3 p.m.", 15, 0)
        testAbsoluteHelper("11 p.m.", 23, 0)
        testAbsoluteHelper("11:30 p.m.", 23, 30)
        testAbsoluteHelper("13 p.m.", 13, 0)
    }

    companion object {
        const val UNUSED_DEFAULT = -1

        @BeforeClass
        @JvmStatic
        fun setup() {
            Alarm.register()
        }
    }
}
