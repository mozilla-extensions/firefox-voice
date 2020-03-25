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
        ) =
            pr.slots[APP_KEY]?.let {
                metadata.getPackageForAppName(it)?.run {
                    context?.packageManager?.getLaunchIntentForPackage(
                        this
                    )
                }
            }
    }
}

fun String?.toModeSuffix() = if (this.isNullOrEmpty()) "" else "&mode=$this"
