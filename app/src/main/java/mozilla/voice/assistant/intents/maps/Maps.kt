package mozilla.voice.assistant.intents.maps

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.annotation.VisibleForTesting
import mozilla.voice.assistant.IntentRunner
import mozilla.voice.assistant.ParseResult

class Maps {
    companion object {
        @VisibleForTesting
        internal const val LOCATION_KEY = "location"

        @VisibleForTesting
        internal const val THING_KEY = "thing"

        @VisibleForTesting
        internal const val MODE_KEY = "mode"

        @VisibleForTesting
        internal const val BIKE_MODE = "bike"

        @VisibleForTesting
        internal const val WALK_MODE = "walk"

        fun register() {
            IntentRunner.registerIntent(
                "maps.navigate",
                ::createNavigateIntent
            )

            IntentRunner.registerIntent(
                "maps.recommend",
                ::createSearchIntent
            )
        }

        private fun createNavigateIntent(
            pr: ParseResult,
            @Suppress("UNUSED_PARAMETER") context: Context?
        ): android.content.Intent? =
            pr.slots[LOCATION_KEY]?.let {
                Intent(
                    Intent.ACTION_VIEW,
                    Uri.parse("google.navigation:q=$it${pr.parameters[MODE_KEY].toModeSuffix()}")
                )
            }

        private fun createSearchIntent(
            pr: ParseResult,
            @Suppress("UNUSED_PARAMETER") context: Context?
        ): android.content.Intent? =
            pr.slots[THING_KEY]?.let { thing ->
                val suffix = pr.slots[LOCATION_KEY]?.let { " in $it" } ?: ""
                Intent(
                    Intent.ACTION_VIEW,
                    Uri.parse("geo:0.0?q=$thing$suffix")
                )
            }
    }
}

fun String?.toModeSuffix() = if (this.isNullOrEmpty()) "" else "&mode=$this"
