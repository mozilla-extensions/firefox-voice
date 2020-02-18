package mozilla.voice.assistant.intents.alarm

import android.content.Context
import android.content.Intent
import android.provider.AlarmClock
import mozilla.voice.assistant.IntentRunner
import mozilla.voice.assistant.MatcherResult

class Alarm {
    companion object {
        private const val HOUR_KEY = "hour"
        private const val MIN_KEY = "minute"
        private const val PERIOD_KEY = "period"
        private const val HOURS_PER_PERIOD = 12 // AM/PM

        fun register() {
            IntentRunner.registerIntent(
                mozilla.voice.assistant.Intent(
                    "Alarm - set general",
                    "Set an alarm for the specified",
                    listOf("Set alarm for 11:50 am", "Set alarm for 1"),
                    listOf(
                        "set alarm for [$HOUR_KEY]",
                        "set alarm for [$HOUR_KEY] a.m. {$PERIOD_KEY=am}",
                        "set alarm for [$HOUR_KEY] p.m. {$PERIOD_KEY=pm}",
                        "set alarm for [$HOUR_KEY] : [$MIN_KEY]",
                        "set alarm for [$HOUR_KEY] : [$MIN_KEY] a.m. {$PERIOD_KEY=am}",
                        "set alarm for [$HOUR_KEY] : [$MIN_KEY] p.m. {$PERIOD_KEY=pm}",
                        "set alarm for (12|) noon {$PERIOD_KEY=noon}",
                        "set alarm for (12|) midnight {$PERIOD_KEY=midnight}"
                    ),
                    ::createAlarmIntent
                )
            )
        }

        private fun calculateTime(hour: String?, mins: String?, period: String?): Pair<Int, Int> =
            if (hour == null) { // must be noon or midnight
                Pair(
                    if (period == "noon") 12 else 0,
                    0
                )
            } else {
                Pair(
                    calculateHour(hour.toInt(), period), // might through number format exception
                    mins?.toInt() ?: 0
                )
            }

        private fun createAlarmIntent(
            mr: MatcherResult,
            @Suppress("UNUSED_PARAMETER") context: Context?
        ): android.content.Intent? =
            try {
                val (hours, mins) = calculateTime(
                    mr.slots[HOUR_KEY],
                    mr.slots[MIN_KEY],
                    mr.slots[PERIOD_KEY]
                )
                Intent(AlarmClock.ACTION_SET_ALARM).apply {
                    putExtra(AlarmClock.EXTRA_HOUR, hours)
                    putExtra(AlarmClock.EXTRA_MINUTES, mins)
                }
            } catch (_: NumberFormatException) {
                null
            }

        private fun calculateHour(hour: Int, period: String?): Int =
            when (period) {
                null -> hour
                "am" -> if (hour == HOURS_PER_PERIOD) 0 else hour
                "pm" -> (hour % HOURS_PER_PERIOD) + HOURS_PER_PERIOD
                else -> hour // should not happen
            }
    }
}
