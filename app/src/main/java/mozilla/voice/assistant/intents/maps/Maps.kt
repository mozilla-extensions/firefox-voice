package mozilla.voice.assistant.intents.maps

import android.content.Context
import android.content.Intent
import android.net.Uri
import mozilla.voice.assistant.IntentRunner
import mozilla.voice.assistant.MatcherResult

class Maps {
    companion object {
        private const val LOCATION_KEY = "location"
        private const val MODE_KEY = "mode"
        private const val BIKE_MODE = 'b'
        private const val WALK_MODE = 'w'
        private const val APP_KEY = "app"

        fun register() {
            IntentRunner.registerIntent(
                mozilla.voice.assistant.Intent(
                    "Maps - navigate",
                    "Navigate to a specific destination",
                    listOf("Show me how to get to Carnegie Hall", "Navigate to 345 Spear Street"),
                    listOf(
                        "(show|tell) me (how to get|how to drive|directions) to [$LOCATION_KEY]",
                        "(give me|i'd like) (car|driving|) directions to [$LOCATION_KEY]",
                        "navigate (by car) to [$LOCATION_KEY]",
                        "(show|tell) (me|) how to (bike|bicycle|cycle) to [$LOCATION_KEY] [$MODE_KEY=$BIKE_MODE]",
                        "(show|tell) (me|) how to get to [$LOCATION_KEY] by (bike|biking|bicycle|bicycling|cycling) [$MODE_KEY=$BIKE_MODE]",
                        "(show|tell) (me|) how to walk to [$LOCATION_KEY] [$MODE_KEY=$WALK_MODE]",
                        "(show|tell) (me|) how to get to [$LOCATION_KEY] (by walking|on foot) $MODE_KEY=$WALK_MODE]",
                        "what's the (best|fastest|quickest) way to get to [$LOCATION_KEY] (by car|)",
                        "what's the (best|fastest|quickest) way to drive to [$LOCATION_KEY] (by car|)",
                        "what's the (best|fastest|quickest) way to get to [$LOCATION_KEY] (on foot|by walking) [$MODE_KEY=$WALK_MODE]",
                        "what's the (best|fastest|quickest) way to walk to [$LOCATION_KEY] [$MODE_KEY=$WALK_MODE]",
                        "what's the (best|fastest|quickest) way to get to [$LOCATION_KEY] (by|on) (bike|biking|bicycle|bicycling|cycling) [$MODE_KEY=$BIKE_MODE]",
                        "what's the (best|fastest|quickest) way to (bike|bicycle|cycle) to [$LOCATION_KEY] [$MODE_KEY=$BIKE_MODE]"
                    ),
                    ::createNavigateIntent
                )
            )
        }

        private fun createNavigateIntent(
            mr: MatcherResult,
            @Suppress("UNUSED_PARAMETER") context: Context?
        ): android.content.Intent? =
            mr.slots[LOCATION_KEY]?.let {
                Intent(
                    Intent.ACTION_VIEW,
                    Uri.parse("navigation:q=$it${mr.parameters[MODE_KEY].toModeSuffix()}")
                )
            }
    }
}

fun String?.toModeSuffix() = if (this.isNullOrEmpty()) "" else "&mode=$this"
