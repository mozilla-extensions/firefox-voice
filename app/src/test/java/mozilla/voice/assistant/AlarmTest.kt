package mozilla.voice.assistant

import android.provider.AlarmClock
import java.util.Calendar
import mozilla.voice.assistant.intents.alarm.Alarm
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.BeforeClass
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class AlarmTest {
    private val calendar330PM = Calendar.getInstance()

    @Before
    fun setCalendar() {
        calendar330PM.set(Calendar.HOUR_OF_DAY, 15)
        calendar330PM.set(Calendar.MINUTE, 30)
    }

    private fun testAbsoluteHelper(time: String, hour: Int, min: Int) {
        /*
        val utterance = "set alarm for $time"
        IntentRunner.processUtterance(utterance)?.let {
            assertEquals(AlarmClock.ACTION_SET_ALARM, it.action)
            assertTrue(it.hasExtra(AlarmClock.EXTRA_HOUR))
            assertEquals(hour, it.getIntExtra(AlarmClock.EXTRA_HOUR, UNUSED_DEFAULT))
            assertTrue(it.hasExtra(AlarmClock.EXTRA_MINUTES))
            assertEquals(min, it.getIntExtra(AlarmClock.EXTRA_MINUTES, UNUSED_DEFAULT))
        } ?: fail("Did not parse as alarm request: $utterance")

         */
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

    private fun testRelativeHelper(hour: String?, min: String?, h: Int, m: Int) =
        Alarm.calculateWhenRelative(hour, min, calendar330PM).run {
            assertEquals(h, get(Calendar.HOUR_OF_DAY))
            assertEquals(m, get(Calendar.MINUTE))
        }

    @Test
    fun testCalculateWhenRelative() {
        testRelativeHelper("1", null, CURRENT_HOUR + 1, CURRENT_MIN)
        testRelativeHelper(null, "20", CURRENT_HOUR, CURRENT_MIN + 20)
        testRelativeHelper("2", "10", CURRENT_HOUR + 2, CURRENT_MIN + 10)
    }

    companion object {
        const val UNUSED_DEFAULT = -1 // default argument to Intent.getIntExtra()
        const val CURRENT_HOUR = 15
        const val CURRENT_MIN = 30

        @BeforeClass
        @JvmStatic
        fun setup() {
            Alarm.register()
        }
    }
}
