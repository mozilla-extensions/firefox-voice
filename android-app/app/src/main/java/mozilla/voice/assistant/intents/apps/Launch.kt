package mozilla.voice.assistant.intents.apps

import android.content.Context
import android.content.Intent
import mozilla.voice.assistant.MainActivity
import mozilla.voice.assistant.intents.Metadata
import mozilla.voice.assistant.intents.ParseResult

class Launch {
    companion object {
        private const val APP_KEY = "app"

        internal fun getIntents() = listOf(
            Pair(
                "launch.installed",
                ::openApp
            ),
            Pair(
                "launch.uninstalled",
                ::suggestInstall
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
            } ?: suggestInstall(pr, context, metadata)
        }

        private fun suggestInstall(
            pr: ParseResult,
            context: Context?,
            @Suppress("UNUSED_PARAMETER") metadata: Metadata
        ): Intent? = pr.slots[APP_KEY]?.let { appName ->
            context?.let {
                MainActivity.createIntent(
                    it,
                    "$appName is not installed",
                    "search for $appName in Google Play Store"
                )
            }
        }
    }
}
