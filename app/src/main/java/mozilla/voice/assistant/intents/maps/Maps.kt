package mozilla.voice.assistant.intents.maps

import android.content.Context
import android.content.Intent
import android.net.Uri
import mozilla.voice.assistant.IntentRunner
import mozilla.voice.assistant.MatcherResult

class Maps {
    companion object {
        private const val LOCATION_KEY = "location"

        fun register() {
            IntentRunner.registerIntent(
                mozilla.voice.assistant.Intent(
                    "Maps - navigate",
                    "Navigate to a specific destination",
                    listOf("Show me how to get to Carnegie Hall", "Navigate to 345 Spear Street"),
                    listOf(
                        "(show|tell) me (how to get|directions) to [$LOCATION_KEY]",
                        "give me directions to [$LOCATION_KEY]",
                        "navigate to [$LOCATION_KEY]"
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
                Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=$it"))
            }
    }
}
