package mozilla.voice.assistant.intents.apps

import android.content.Context
import android.content.Intent
import android.net.Uri
import mozilla.voice.assistant.intents.Metadata
import mozilla.voice.assistant.intents.ParseResult

class Install {
    companion object {
        private const val APP_KEY = "app"

        internal fun getIntents() = listOf(
            Pair(
                "install.install",
                // In the future, we might want to have the ids of common apps in a lookup table
                // or check whether the app is already installed.
                ::searchForApp
            ),
            Pair(
                "install.search",
                ::searchForApp
            )
        )

        private fun searchForApp(
            pr: ParseResult,
            @Suppress("UNUSED_PARAMETER") context: Context?,
            @Suppress("UNUSED_PARAMETER") metadata: Metadata
        ) = pr.slots[APP_KEY]?.let { appName ->
                Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse("https://play.google.com/store/search?q=${Uri.encode(appName)}&c=apps")
                }
        }
    }
}
