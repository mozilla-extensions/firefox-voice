package mozilla.voice.assistant.intents.alarm

import android.content.Context
import android.content.Intent
import android.provider.AlarmClock
import java.util.Calendar
import java.util.Locale
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
                        // Periods at ends of words get removed, so use "a.m" instead of "a.m.".
                        "set alarm for [$HOUR_KEY:number]",
                        "set alarm for [$HOUR_KEY:number] a.m [$PERIOD_KEY=am]",
                        "set alarm for [$HOUR_KEY:number] p.m [$PERIOD_KEY=pm]",
                        "set alarm for [$HOUR_KEY:number]:[$MIN_KEY:number]",
                        "set alarm for [$HOUR_KEY:number]:[$MIN_KEY:number] a.m [$PERIOD_KEY=am]",
                        "set alarm for [$HOUR_KEY:number]:[$MIN_KEY:number] p.m [$PERIOD_KEY=pm]",
                        "set alarm for (12|) noon [$PERIOD_KEY=noon]",
                        "set alarm for (12|) midnight [$PERIOD_KEY=midnight]"
                    ),
                    ::createAlarmIntent
                )
            )
        }

        private fun calculateWhen(
            hour: String?,
            mins: String?,
            period: Period,
            now: Calendar = Calendar.getInstance()
        ) =
            // For now, copy year, month, day, seconds, and time zone
            (now.clone() as Calendar).apply {
                hour?.toInt()?.let { set(Calendar.HOUR_OF_DAY, it) }
                (mins?.toInt() ?: 0).let { set(Calendar.MINUTE, it) }

                // Adjust for period of day.
                set(
                    Calendar.HOUR_OF_DAY,
                    when (period) {
                        Period.MIDNIGHT -> 0
                        Period.AM, Period.NONE -> hour?.toInt() ?: throw Error("Hour required")
                        Period.NOON -> 12
                        Period.PM -> ((hour?.toInt()
                            ?: throw Error("Hour required with p.m.")) % HOURS_PER_PERIOD) + HOURS_PER_PERIOD
                    }
                )
            }

        private fun createAlarmIntent(
            mr: MatcherResult,
            @Suppress("UNUSED_PARAMETER") context: Context?
        ): android.content.Intent? =
            try {
                calculateWhen(
                    mr.slots[HOUR_KEY],
                    mr.slots[MIN_KEY],
                    mr.parameters[PERIOD_KEY].toPeriod()
                ).let { then ->
                    Intent(AlarmClock.ACTION_SET_ALARM).apply {
                        putExtra(AlarmClock.EXTRA_HOUR, then.get(Calendar.HOUR_OF_DAY))
                        putExtra(AlarmClock.EXTRA_MINUTES, then.get(Calendar.MINUTE))
                    }
                }
            } catch (_: NumberFormatException) {
                null
            }
    }
}

fun String?.toPeriod() =
    when (this?.toLowerCase(Locale.getDefault())) {
        "midnight" -> Period.MIDNIGHT
        "am" -> Period.AM
        "noon" -> Period.NOON
        "pm" -> Period.PM
        null -> Period.NONE
        else -> throw Error("Illegal argument $this in String.toPeriod()")
    }

enum class Period {
    MIDNIGHT, AM, NOON, PM, NONE
}
