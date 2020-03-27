package mozilla.voice.assistant.intents

import java.util.Calendar
import mozilla.voice.assistant.intents.alarm.Alarm
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class AlarmTest {
    private val calendar330PM = Calendar.getInstance()

    @BeforeEach
    fun setup() {
        calendar330PM.set(Calendar.HOUR_OF_DAY, 15)
        calendar330PM.set(Calendar.MINUTE, 30)
    }

    private fun testGetHoursMins(
        expectedHours: Int,
        expectedMinutes: Int,
        hours: String? = null,
        minutes: String? = null,
        time: String? = null,
        period: String? = null
    ) {
        val slots = mutableMapOf<String, String>()
        hours?.let { slots[Alarm.HOUR_KEY] = hours }
        minutes?.let { slots[Alarm.MIN_KEY] = minutes }
        time?.let { slots[Alarm.TIME_KEY] = time }
        period?.let { slots[Alarm.PERIOD_KEY] = period }
        val parameters = if (period == null) emptyMap() else mapOf(Alarm.PERIOD_KEY to period)
        val pair = Alarm.getHoursMins(slots, parameters)
        assertEquals(expectedHours, pair.first)
        assertEquals(expectedMinutes, pair.second)
    }

    @Test
    fun testMidnight() {
        testGetHoursMins(0, 0, period = "midnight")
        testGetHoursMins(0, 0, hours = "12", period = "midnight")
    }

    @Test
    fun testNoon() {
        testGetHoursMins(12, 0, period = "noon")
        testGetHoursMins(12, 0, "12", period = "noon")
    }

    @Test
    fun testNoPeriod() {
        testGetHoursMins(6, 0, hours = "6")
        testGetHoursMins(6, 0, time = "6:00")
        testGetHoursMins(13, 0, hours = "13")
        testGetHoursMins(13, 0, time = "13:00")
        testGetHoursMins(5, 15, hours = "5", minutes = "15")
        testGetHoursMins(5, 15, time = "5:15")
    }

    @Test
    fun testAM() {
        testGetHoursMins(3, 0, time = "3:00", period = "a.m.")
        testGetHoursMins(11, 0, time = "11:00", period = "a.m.")
        testGetHoursMins(11, 30, time = "11:30", period = "a.m.")
    }

    @Test
    fun testPM() {
        testGetHoursMins(15, 0, time = "3:00", period = "p.m.")
        testGetHoursMins(23, 0, time = "11:00", period = "p.m.")
        testGetHoursMins(23, 30, time = "11:30", period = "p.m.")
    }

    private fun testRelativeHelper(hour: String?, min: String?, h: Int, m: Int) =
        Alarm.calculateWhenRelative(hour, min, calendar330PM).run {
            assertEquals(h, get(Calendar.HOUR_OF_DAY))
            assertEquals(m, get(Calendar.MINUTE))
        }

    @Test
    fun testCalculateWhenRelative() {
        testRelativeHelper("1", null, CURRENT_HOUR + 1,
            CURRENT_MIN
        )
        testRelativeHelper(null, "20",
            CURRENT_HOUR, CURRENT_MIN + 20)
        testRelativeHelper("2", "10", CURRENT_HOUR + 2, CURRENT_MIN + 10)
    }

    companion object {
        const val CURRENT_HOUR = 15
        const val CURRENT_MIN = 30
    }
}
