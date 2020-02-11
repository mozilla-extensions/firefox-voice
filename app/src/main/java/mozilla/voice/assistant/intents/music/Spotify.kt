package mozilla.voice.assistant.intents.music

import android.net.Uri
import mozilla.voice.assistant.Intent
import mozilla.voice.assistant.IntentRunner
import mozilla.voice.assistant.MatcherResult

class Spotify {
    companion object {
        private const val QUERY_KEY = "query"
        // I determined the URI by creating an Intent programmatically, then calling toUri on it.
        private const val TEMPLATE =
            "#Intent;action=android.media.action.MEDIA_PLAY_FROM_SEARCH;launchFlags=0x10000000;component=com.spotify.music/.MainActivity;S.query=%1;end"

        fun register() {
            IntentRunner.registerIntent(
                Intent(
                    "Spotify",
                    "Do a Spotify search",
                    listOf("Search for David Bowie on Spotify"),
                    listOf(
                        "Search for [$QUERY_KEY] on Spotify",
                        "(Find | Look up) [$QUERY_KEY] on Spotify"
                    ),
                    ::createIntent
                )
            )
        }

        private fun createIntent(mr: MatcherResult): android.content.Intent {
            return android.content.Intent.parseUri(
                TEMPLATE.replace("%1", Uri.encode(mr.slots[QUERY_KEY])),
                0
            )
        }
    }
}
