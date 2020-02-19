package mozilla.voice.assistant

import android.provider.AlarmClock
import junit.framework.Assert.assertEquals
import junit.framework.Assert.assertTrue
import junit.framework.Assert.fail
import mozilla.voice.assistant.intents.alarm.Alarm
import org.junit.BeforeClass
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class AlarmTest {

    private fun testHelper(time: String, hour: Int, min: Int) {
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
        testHelper("midnight", 0, 0)
        testHelper("12 midnight", 0, 0)
    }

    @Test
    fun testNoon() {
        testHelper("noon", 12, 0)
        testHelper("12 noon", 12, 0)
    }

    @Test
    fun testNoPeriod() {
        testHelper("6", 6, 0)
        testHelper("13", 13, 0)
        testHelper("5:15", 5, 15)
    }

    @Test
    fun testAM() {
        testHelper("3 a.m.", 3, 0)
        testHelper("11 a.m.", 11, 0)
        testHelper("11:30 a.m.", 11, 30)
    }

    @Test
    fun testPM() {
        testHelper("3 p.m.", 15, 0)
        testHelper("11 p.m.", 23, 0)
        testHelper("11:30 p.m.", 23, 30)
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
