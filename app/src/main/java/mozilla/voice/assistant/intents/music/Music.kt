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
        private val SERVICES = mapOf(
            "google" to Pair("com.google.android.music",
                "com.google.android.music.ui.search.VoiceActionsActivity"),
            // VoiceActivity isn't exported, MainActivity doesn't use the argument
            "spotify" to Pair("com.spotify.music", "com.spotify.music.MainActivity")
        )

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
            val intent = mr.slots[SERVICE_KEY]?.let {
                // Use only the first word of service name ("Google Play" -> "Google")
                SERVICES[it.substringBefore(' ').toLowerCase()]?. let { service ->
                    android.content.Intent().apply {
                        setClassName(service.first, service.second)
                        setAction(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH);
                    }
                }
            } ?:  android.content.Intent(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH)
            intent.putExtra(SearchManager.QUERY, mr.slots[QUERY_KEY])
            return intent
        }
    }
}
