package mozilla.voice.assistant.intents.music

import android.app.SearchManager
import android.content.Context
import android.provider.MediaStore
import mozilla.voice.assistant.intents.Metadata
import mozilla.voice.assistant.intents.ParseResult

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

        internal fun getIntents() = listOf(
            Pair(
                "music.search",
                ::createSearchIntent
            ),
            Pair(
                "music.play",
                ::createPlayIntent
            )
        )

        // Both query and service are defined.
        private fun createSearchIntent(
            pr: ParseResult,
            @Suppress("UNUSED_PARAMETER") context: Context?,
            @Suppress("UNUSED_PARAMETER") metdata: Metadata
        ): android.content.Intent {
            val query = pr.slots[QUERY_KEY]
            val service = pr.slots[SERVICE_KEY]?.firstWord()
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
                SERVICES[service.toLowerCase()]?.let { spec ->
                    setClassName(spec.topPackage, spec.searchActivity)
                    setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                putExtra(SearchManager.QUERY, query)
            }
        }

        private fun createPlayIntent(
            pr: ParseResult,
            @Suppress("UNUSED_PARAMETER") context: Context?,
            @Suppress("UNUSED_PARAMETER") metdata: Metadata
        ): android.content.Intent {
            val intent = pr.slots[SERVICE_KEY]?.let {
                // Use only the first word of service name ("Google Play" -> "Google")
                // TODO: Distinguish between "YouTube" and "YouTube Music".
                SERVICES[it.firstWord()]?.let { spec ->
                    android.content.Intent(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH).apply {
                        setClassName(spec.topPackage, spec.playActivity)
                    }
                }
            } ?: android.content.Intent(MediaStore.INTENT_ACTION_MEDIA_PLAY_FROM_SEARCH)
            intent.putExtra(SearchManager.QUERY, pr.slots[QUERY_KEY])
            return intent
        }
    }
}

private data class ServiceSpec(
    val topPackage: String,
    val playActivity: String, // activity for handing play requests
    val searchActivity: String = playActivity // activity for handling search requests
)
