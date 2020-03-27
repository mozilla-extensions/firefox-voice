package mozilla.voice.assistant.intents.launch

import android.content.Context
import java.lang.AssertionError
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
                metadata.getPackageForAppName(it)?.let {
                    // This could be null if the app was uninstalled after the
                    // helper app started.
                    context?.packageManager?.getLaunchIntentForPackage(it)
                } ?: throw AssertionError("Unable to find app named '$it'")
            } ?: throw AssertionError("No app slot available in openApp?!?!")
    }
}
