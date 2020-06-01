package mozilla.voice.assistant.intents.launch

import android.content.Context
import mozilla.voice.assistant.intents.Metadata
import mozilla.voice.assistant.intents.ParseResult

class Launch {
    companion object {
        private const val APP_KEY = "app"

        internal fun getIntents() = listOf(
            Pair(
                "launch.launch",
                ::openApp
            )
        )

        private fun openApp(
            pr: ParseResult,
            context: Context?,
            metadata: Metadata
        ) = pr.slots[APP_KEY]?.let { appName ->
            // This could be null if the app was uninstalled after the helper app started.
            metadata.getPackageForAppName(appName)?.let {
                context?.packageManager?.getLaunchIntentForPackage(it)
            }
        }
    }
}
