package mozilla.voice.assistant.intents.music

import android.app.SearchManager
import android.content.ComponentName
import android.provider.MediaStore
import mozilla.voice.assistant.Intent
import mozilla.voice.assistant.IntentRunner
import mozilla.voice.assistant.MatcherResult

class Spotify {
    companion object {
        private const val QUERY_KEY = "query"

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
            // https://stackoverflow.com/a/29045294/631051
            val intent = android.content.Intent(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH)
            intent.component =
                ComponentName(
                    "com.spotify.music",
                    "com.spotify.music.MainActivity"
                )
            intent.putExtra(
                MediaStore.EXTRA_MEDIA_FOCUS,
                MediaStore.Audio.Artists.ENTRY_CONTENT_TYPE
            )
            intent.putExtra(MediaStore.EXTRA_MEDIA_ARTIST, mr.slots[QUERY_KEY])
            intent.putExtra(SearchManager.QUERY, mr.slots[QUERY_KEY])
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            return intent
        }
    }
}
