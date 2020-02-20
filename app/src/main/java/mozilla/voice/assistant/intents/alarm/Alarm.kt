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
                    "Alarm - set absolute",
                    "Set an alarm for the specified time",
                    listOf("Set alarm for 11:50 am", "Set alarm for 1", "Set alarm for midnight"),
                    listOf(
                        // Periods at ends of words get removed, so use "a.m" instead of "a.m.".
                        "set (the| ) alarm for [$HOUR_KEY:number]",
                        "set (the| ) alarm for [$HOUR_KEY:number] a.m [$PERIOD_KEY=am]",
                        "set (the| ) alarm for [$HOUR_KEY:number] p.m [$PERIOD_KEY=pm]",
                        "set (the| ) alarm for [$HOUR_KEY:number]:[$MIN_KEY:number]",
                        "set (the| ) alarm for [$HOUR_KEY:number]:[$MIN_KEY:number] a.m [$PERIOD_KEY=am]",
                        "set (the| ) alarm for [$HOUR_KEY:number]:[$MIN_KEY:number] p.m [$PERIOD_KEY=pm]",
                        "set (the| ) alarm for (12|) noon [$PERIOD_KEY=noon]",
                        "set (the| ) alarm for (12|) midnight [$PERIOD_KEY=midnight]"
                    ),
                    ::createAlarmIntent
                )
            )
            IntentRunner.registerIntent(
                mozilla.voice.assistant.Intent(
                    "Alarm - set relative",
                    "Set an alarm for the specified time",
                    listOf("Set alarm for 1 hour from now", "Set alarm 90 minutes from now"),
                    listOf(
                        "set (the| ) alarm (for| ) [$HOUR_KEY:number] (hours|hour) from now",
                        "set (the| ) alarm (for| ) [$MIN_KEY:number] (minutes|minute) from now",
                        "set (the| ) alarm (for| ) [$HOUR_KEY:number] (hours|hour) [$MIN_KEY:number] (minutes|minute) from now"
                    ),
                    ::createRelativeAlarmIntent
                )
            )
        }

        private fun calculateWhenRelative(
            hour: String?,
            mins: String?,
            now: Calendar = Calendar.getInstance()
        ) =
            // For now, copy year, month, day, seconds, and time zone
            (now.clone() as Calendar).apply {
                hour?.toInt()?.let { add(Calendar.HOUR, it) }
                mins?.toInt()?.let { add(Calendar.MINUTE, it) }
            }

        private fun createAlarmIntent(
            mr: MatcherResult,
            @Suppress("UNUSED_PARAMETER") context: Context?
        ): android.content.Intent? =
            try {
                makeAlarmIntent(
                    (mr.slots[HOUR_KEY]?.toInt() ?: 0).let {
                        when (mr.parameters[PERIOD_KEY].toPeriod()) {
                            Period.MIDNIGHT -> 0
                            Period.AM, Period.NONE -> it
                            Period.NOON -> 12
                            Period.PM -> (it % HOURS_PER_PERIOD) + HOURS_PER_PERIOD
                        }
                    },
                    mr.slots[MIN_KEY]?.toInt() ?: 0
                )
            } catch (_: NumberFormatException) {
                null
            }

        private fun makeAlarmIntent(hour: Int, min: Int) =
            Intent(AlarmClock.ACTION_SET_ALARM).apply {
                putExtra(AlarmClock.EXTRA_HOUR, hour)
                putExtra(AlarmClock.EXTRA_MINUTES, min)
            }

        private fun createRelativeAlarmIntent(
            mr: MatcherResult,
            @Suppress("UNUSED_PARAMETER") context: Context?
        ): android.content.Intent? =
            try {
                calculateWhenRelative(
                    mr.slots[HOUR_KEY],
                    mr.slots[MIN_KEY]
                ).toAlarmIntent()
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

fun Calendar.toAlarmIntent() =
    Intent(AlarmClock.ACTION_SET_ALARM).apply {
        putExtra(AlarmClock.EXTRA_HOUR, get(Calendar.HOUR_OF_DAY))
        putExtra(AlarmClock.EXTRA_MINUTES, get(Calendar.MINUTE))
    }

enum class Period {
    MIDNIGHT, AM, NOON, PM, NONE
}
