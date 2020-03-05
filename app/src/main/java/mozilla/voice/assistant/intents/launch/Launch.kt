package mozilla.voice.assistant.intents.launch

import android.content.Context
import mozilla.voice.assistant.IntentRunner
import mozilla.voice.assistant.Metadata.Companion.getPackageForAppName
import mozilla.voice.assistant.ParseResult

class Launch {
    companion object {
        private const val APP_KEY = "app"

        fun register() {
            IntentRunner.registerIntent(
                "launch.launch",
                    ::openApp
            )
        }

        private fun openApp(
            pr: ParseResult,
            context: Context?
        ) =
            pr.slots[APP_KEY]?.let {
                context?.packageManager?.getLaunchIntentForPackage(getPackageForAppName(it) ?: throw Error("Unable to find app $it"))
            }
    }
}

fun String?.toModeSuffix() = if (this.isNullOrEmpty()) "" else "&mode=$this"
