package mozilla.voice.assistant.intents.launch

import android.content.Context
import android.util.Log
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
        ) =
            pr.slots[APP_KEY]?.let {
                context?.packageManager?.getLaunchIntentForPackage(
                    metadata.getPackageForAppName(it)
                ) ?: let {
                    // This should happen only if the app was uninstalled after this one started up.
                    Log.e("Launch", "Unable to find package for app named $it")
                    null
                }
            }
    }
}
