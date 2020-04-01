package mozilla.voice.assistant.intents.alarm

import android.content.Context
import android.content.Intent
import android.provider.AlarmClock
import androidx.annotation.VisibleForTesting
import java.util.Calendar
import java.util.Locale
import mozilla.voice.assistant.intents.Metadata
import mozilla.voice.assistant.intents.ParseResult
import mozilla.voice.assistant.language.TimePattern

class Alarm {
    companion object {
        @VisibleForTesting
        internal const val HOUR_KEY = "hour"
        @VisibleForTesting
        internal const val MIN_KEY = "minute"
        @VisibleForTesting
        internal const val TIME_KEY = "time"
        @VisibleForTesting
        internal const val PERIOD_KEY = "period"
        private const val HOURS_PER_PERIOD = 12 // AM/PM

        internal fun getIntents() = listOf(
            Pair(
                "alarm.setAbsolute",
                ::createAbsoluteAlarmIntent
            ),
            Pair(
                "alarm.setRelative",
                ::createRelativeAlarmIntent
            )
        )

        @VisibleForTesting
        fun calculateWhenRelative(
            hour: String?,
            mins: String?,
            now: Calendar = Calendar.getInstance()
        ) =
            // For now, copy year, month, day, seconds, and time zone
            (now.clone() as Calendar).apply {
                hour?.toInt()?.let { add(Calendar.HOUR, it) }
                mins?.toInt()?.let { add(Calendar.MINUTE, it) }
            }

        @VisibleForTesting
        internal fun getHoursMins(slots: Map<String, String>, parameters: Map<String, String>): Pair<Int, Int> {
            // One of the following is true:
            // - One or both of HOUR_KEY and MIN_KEY are defined. PERIOD_KEY may or may not
            //   be defined.
            // - TIME_KEY is defined, and neither HOUR_KEY nor MIN_KEY is defined. PERIOD_KEY
            //   may or may not be defined.
            // - PERIOD_KEY is the only key defined.
            val (h, m) = slots[TIME_KEY]?.let { time ->
                TimePattern.extractTime(time) ?: throw error("Illegal time value $time")
            } ?: Pair(slots[HOUR_KEY]?.toInt() ?: 0, slots[MIN_KEY]?.toInt() ?: 0)
            return when (parameters[PERIOD_KEY].toPeriod()) {
                Period.MIDNIGHT -> Pair(0, m)
                Period.AM, Period.NONE -> Pair(h, m)
                Period.NOON -> Pair(HOURS_PER_PERIOD, 0)
                Period.PM -> Pair((h % HOURS_PER_PERIOD) + HOURS_PER_PERIOD, m)
            }
        }

        private fun createAbsoluteAlarmIntent(
            pr: ParseResult,
            @Suppress("UNUSED_PARAMETER") context: Context?,
            @Suppress("UNUSED_PARAMETER") metdata: Metadata
        ): android.content.Intent? =
            try {
                makeAlarmIntent(getHoursMins(pr.slots, pr.parameters))
            } catch (_: NumberFormatException) {
                null
            }

        private fun makeAlarmIntent(pair: Pair<Int, Int>) =
            Intent(AlarmClock.ACTION_SET_ALARM).apply {
                putExtra(AlarmClock.EXTRA_HOUR, pair.first)
                putExtra(AlarmClock.EXTRA_MINUTES, pair.second)
            }

        private fun createRelativeAlarmIntent(
            pr: ParseResult,
            @Suppress("UNUSED_PARAMETER") context: Context?,
            @Suppress("UNUSED_PARAMETER") metdata: Metadata
        ): android.content.Intent? =
            try {
                calculateWhenRelative(
                    pr.slots[HOUR_KEY],
                    pr.slots[MIN_KEY]
                ).toAlarmIntent()
            } catch (_: NumberFormatException) {
                null
            }
    }
}

fun String?.toPeriod() =
    when (this?.toLowerCase(Locale.getDefault())?.replace(".", "")) {
        "midnight" -> Period.MIDNIGHT
        "am" -> Period.AM
        "noon" -> Period.NOON
        "pm" -> Period.PM
        null -> Period.NONE
        else -> throw AssertionError("Illegal argument $this in String.toPeriod()")
    }

fun Calendar.toAlarmIntent() =
    Intent(AlarmClock.ACTION_SET_ALARM).apply {
        putExtra(AlarmClock.EXTRA_HOUR, get(Calendar.HOUR_OF_DAY))
        putExtra(AlarmClock.EXTRA_MINUTES, get(Calendar.MINUTE))
    }

enum class Period {
    MIDNIGHT, AM, NOON, PM, NONE
}
