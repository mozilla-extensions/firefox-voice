package mozilla.voice.assistant.intents.music

import android.app.SearchManager
import android.content.Context
import android.provider.MediaStore
import mozilla.voice.assistant.Intent
import mozilla.voice.assistant.IntentRunner
import mozilla.voice.assistant.MatcherResult

fun String.firstWord() = substringBefore(' ')

class Music {
    companion object {
        private const val QUERY_KEY = "query"
        private const val SERVICE_KEY = "service"
        private val SERVICES = mapOf(
            "google" to ServiceSpec(
                "com.google.android.music",
                "com.google.android.music.ui.search.VoiceActionsActivity",
                "com.google.android.music.ui.search.ClusteredSearchActivity"
            ),
            "spotify" to ServiceSpec(
                "com.spotify.music",
                "com.spotify.music.MainActivity"
            ),
            "youtube" to ServiceSpec(
                "com.google.android.youtube",
                "com.google.android.youtube.HomeActivity"
            )
        )

        fun register() {
            IntentRunner.registerIntent(
                Intent(
                    "Music - search",
                    "Do a search on a music service",
                    listOf("Search for David Bowie on Spotify", "Find the Wiggles on Google Play"),
                    listOf(
                        "(do a |) (search | query | look up| look | look up | lookup) (on | in |) (my |) [service:musicServiceName] (for | for the |) [query]",
                        "(do a |) (search | query ) my [service:musicServiceName] (for | for the |) [query]",
                        "(do a |) (search | query ) (on |) [service:musicServiceName] (for | for the) [query]",
                        "(do a |) (search | query | find | find me | look up | lookup | look on | look for) (my | on | for | in |) (the |) [query] (on | in) [service:musicServiceName]"
                    ),
                    ::createSearchIntent
                )
            )

            IntentRunner.registerIntent(
                Intent(
                    "Music - play",
                    "Play music",
                    listOf(
                        "Play 'I want to be sedated' on Spotify",
                        "Play 'Yellow Submarine'",
                        "Play 'Heroes' by David Bowie on Google Play"),
                    listOf(
                        "Play [$QUERY_KEY] (on|in) [$SERVICE_KEY:musicServiceName]",
                        "Play [$QUERY_KEY]"
                    ),
                    ::createPlayIntent
                )
            )
        }

        // Both query and service are defined.
        private fun createSearchIntent(
            mr: MatcherResult,
            @Suppress("UNUSED_PARAMETER") context: Context?
        ): android.content.Intent {
            val query = mr.slots[QUERY_KEY]
            val service = mr.slots[SERVICE_KEY]?.firstWord()
            if (query == null || service == null) {
                // This should never happen.
                throw Exception("Slot values were not present")
            }
            return android.content.Intent(
                when (service) {
                    "youtube", "pandora" -> MediaStore.INTENT_ACTION_MEDIA_SEARCH
                    else -> android.content.Intent.ACTION_SEARCH
                }
            ).apply {
                SERVICES[service]?.let { spec ->
                    setClassName(spec.topPackage, spec.searchActivity)
                    setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                putExtra(SearchManager.QUERY, query)
            }
        }

        private fun createPlayIntent(
            mr: MatcherResult,
            @Suppress("UNUSED_PARAMETER") context: Context?
        ): android.content.Intent {
            val intent = mr.slots[SERVICE_KEY]?.let {
                // Use only the first word of service name ("Google Play" -> "Google")
                // TODO: Distinguish between "YouTube" and "YouTube Music".
                SERVICES[it.firstWord()]?.let { spec ->
                    android.content.Intent(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH).apply {
                        setClassName(spec.topPackage, spec.playActivity)
                    }
                }
            } ?: android.content.Intent(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH)
            intent.putExtra(SearchManager.QUERY, mr.slots[QUERY_KEY])
            return intent
        }
    }
}

private data class ServiceSpec(
    val topPackage: String,
    val playActivity: String, // activity for handing play requests
    val searchActivity: String = playActivity // activity for handling search requests
)
