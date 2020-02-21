package mozilla.voice.assistant.intents.launch

import android.content.Context
import mozilla.voice.assistant.IntentRunner
import mozilla.voice.assistant.MatcherResult

class Launch {
    companion object {
        private const val APP_KEY = "app"
        private const val GOOGLE_MAPS = "google"
        private const val WAZE = "waze"

        internal val apps = mapOf(
            GOOGLE_MAPS to "com.google.android.apps.maps",
            WAZE to "com.waze"
        )

        fun register() {
            IntentRunner.registerIntent(
                mozilla.voice.assistant.Intent(
                    "Launch - launch the named app",
                    "Launch the named app",
                    listOf("Open Google Maps", "Launch Waze", "Start Maps"),
                    listOf(
                        "(open|launch|start) (google|) maps [$APP_KEY=$GOOGLE_MAPS]",
                        "(open|launch|start) waze [$APP_KEY=$WAZE]"
                    ),
                    ::openApp
                )
            )
        }

        private fun openApp(
            mr: MatcherResult,
            context: Context?
        ) =
            apps[mr.parameters[APP_KEY]]?.let {
                // TODO: Throw exception if application isn't installed?
                context?.packageManager?.getLaunchIntentForPackage(it)
            }
    }
}

fun String?.toModeSuffix() = if (this.isNullOrEmpty()) "" else "&mode=$this"
