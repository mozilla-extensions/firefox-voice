package mozilla.voice.assistant.intents

import android.content.Context
import android.content.Intent
import java.util.Locale
import mozilla.voice.assistant.language.Language

class Metadata(context: Context, private val language: Language) {
    private val parser = TomlParser()
    private val appMap: Map<String, String> // app names -> package names
    private val unstoppedAppMap: Map<String, String> // app names w/o stop words -> package names
    internal fun getAppNames() = appMap.keys

    internal fun getPackageForAppName(appName: String): String? {
        val lower = appName.toLowerCase(Locale.getDefault())
        return appMap[lower] ?: unstoppedAppMap[lower]
    }

    init {
        // Determine which apps are installed, in order to set entity appNames.
        appMap = buildAppMap(context)
        unstoppedAppMap = appMap.mapKeys { language.stripStopwords(it.key) }

        // Read in each intent's .toml file.
        context.assets?.list("")?.forEach {
            if (it.contains(".toml")) {
                parser.parse(context.assets.open(it))
            }
        }
    }

    internal fun getDescription(intentName: String) =
        parser.getString(intentName, "description")
            ?: throw TomlException("Unable to get description for $intentName")

    internal fun getExamples(intentName: String): List<String> =
        parser.getStrings("$intentName.example", "phrase")
            ?: parser.getStrings("$intentName.examples", "phrase")
            ?: throw TomlException("Unable to get examples for $intentName")

    internal fun getPhrases(intentName: String): List<String> =
        parser.getString(intentName, "match")?.trim()?.split('\n', '\r')
            ?: throw TomlException("Unable to get phrases for $intentName")

    private fun buildAppMap(context: Context): Map<String, String> =
        context.packageManager.let { pm ->
            pm.queryIntentActivities(
                Intent(
                    Intent.ACTION_MAIN,
                    null
                ).apply {
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
}
