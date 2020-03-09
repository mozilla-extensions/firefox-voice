package mozilla.voice.assistant

import android.content.Context
import android.content.Intent
import java.util.Locale

class Metadata {
    companion object {
        private var initialized = false
        private val parser = TomlParser()
        private lateinit var appMap: Map<String, String>
        internal fun getAppNames() = appMap.keys
        internal fun getPackageForAppName(appName: String) =
            appMap[appName.toLowerCase(Locale.getDefault())]

        internal fun getDescription(intentName: String) =
            parser.getString(intentName, "description")
                ?: throw Error("Unable to get description for $intentName")

        internal fun getExamples(intentName: String): List<String> =
            parser.getStrings("$intentName.example", "phrase")
                ?: parser.getStrings("$intentName.examples", "phrase")
                ?: throw Error("Unable to get examples for $intentName")

        internal fun getPhrases(intentName: String): List<String> =
            parser.getString(intentName, "match")?.trim()?.split('\n', '\r')
                ?: throw Error("Unable to get phrases for $intentName")

        private fun buildAppMap(context: Context): Map<String, String> =
            context.packageManager.let { pm ->
                pm.queryIntentActivities(
                    Intent(Intent.ACTION_MAIN, null).apply {
                        addCategory(Intent.CATEGORY_LAUNCHER)
                    },
                    0
                ).mapNotNull {
                    if (it.activityInfo.exported) {
                        val packageName = it.activityInfo.packageName
                        Pair(
                            pm.getApplicationLabel(pm.getApplicationInfo(packageName, 0))
                                .toString().toLowerCase(
                                    Locale.getDefault()
                                ),
                            packageName
                        )
                    } else {
                        null
                    }
                }
            }.toMap()

        // This must be called before anything is compiled.
        internal fun initialize(context: Context) {
            require(!initialized)
            // Determine which apps are installed, in order to set entity appNames.
            appMap = buildAppMap(context)

            // Read in each intent's .toml file.
            context.assets?.list("")?.forEach {
                if (it.contains(".toml")) {
                    parser.parse(context.assets.open(it))
                }
            }
            initialized = true
        }
    }
}
