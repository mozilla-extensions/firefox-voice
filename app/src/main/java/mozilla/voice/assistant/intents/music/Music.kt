package mozilla.voice.assistant.intents.music

import android.app.SearchManager
import android.content.Context
import android.net.Uri
import android.provider.MediaStore
import mozilla.voice.assistant.Intent
import mozilla.voice.assistant.IntentRunner
import mozilla.voice.assistant.MatcherResult

class Music {
    companion object {
        private const val QUERY_KEY = "query"
        private const val SERVICE_KEY = "service"
        private const val SPOTIFY_SEARCH_TEMPLATE =
            "spotify:search:%1" // https://stackoverflow.com/a/19814669

        fun register() {
            IntentRunner.registerIntent(
                Intent(
                    "Spotify - search",
                    "Do a Spotify search",
                    listOf("Search for David Bowie on Spotify", "Find the Wiggles on Spotify"),
                    listOf(
                        "Search for [$QUERY_KEY] on Spotify",
                        "(Find | Look up) [$QUERY_KEY] on Spotify"
                    ),
                    ::createSearchIntent
                )
            )

            IntentRunner.registerIntent(
                Intent(
                    "Spotify - play",
                    "Play music on Spotify",
                    listOf("Play 'I want to be sedated' on Spotify", "Play 'Yellow Submarine'"),
                    listOf(
                        "Play [$QUERY_KEY] on [$SERVICE_KEY:musicServiceName]",
                        "Play [$QUERY_KEY]"
                    ),
                    ::createPlayIntent
                )
            )
        }

        private fun createSearchIntent(
            mr: MatcherResult,
            context: Context?
        ): android.content.Intent {
            return android.content.Intent.parseUri(
                SPOTIFY_SEARCH_TEMPLATE.replace("%1", Uri.encode(mr.slots[QUERY_KEY])),
                0
            )
        }

        private fun createPlayIntent(mr: MatcherResult, context: Context?): android.content.Intent {
            val intent = if (mr.slots.containsKey(SERVICE_KEY)) {
                // While testing, hardcode Google Music
                android.content.Intent().apply {
                    setClassName(
                        "com.google.android.music",
                        "com.google.android.music.VoiceActionsActivity"
                    );
                    setAction(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH);
                }
            } else {
                // Use default app or prompt user.
                android.content.Intent(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH)
            }
            intent.putExtra(SearchManager.QUERY, mr.slots[QUERY_KEY])
            return intent
        }
    }
}
