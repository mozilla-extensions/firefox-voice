package mozilla.voice.assistant.intents

import android.content.Context
import android.content.Intent
import java.util.Locale
import mozilla.voice.assistant.language.Language

class Metadata(context: Context, private val language: Language) {
    private val parser = TomlParser()

    // These get initialized in buildAppMap(), which is called from init.
    private lateinit var appMap: Map<String, String> // app name -> package name
    private lateinit var unstoppedAppMap: Map<String, List<String>> // app name w/o stop words -> app names

    internal fun getAppNames() = appMap.keys

    internal fun getPackageForAppName(appName: String): String? {
        val lowerAppName = appName.toLowerCase(Locale.getDefault())
        return appMap[lowerAppName] ?: run {
            // There are two possibilities involving stopwords:
            // 1. appName (utterance) contains stopwords and app name does not
            //    (e.g., "the washington post" for "washington post").
            // 2. appName (utterance) and app name both contain stop words
            //    (e.g., "please be my eyes" and "be my eyes" where stopwords are: please, be, my).
            //    In this case, removing stopwords from appName gives a key in unstoppedAppMap
            // In either case, we want to use unstoppedAppMap to determine possible full app
            // names, then choose the longest of these that is a substring of appName
            val unstoppedAppName = language.stripStopwords(lowerAppName)
            unstoppedAppMap[unstoppedAppName] ?.let { appNames ->
                val longestAppName =
                    appNames.filter { lowerAppName.contains(it) }.maxBy { it.length }
                appMap[longestAppName]
            }
        }
    }

    init {
        buildAppMap(context)

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

    private fun buildAppMap(entries: List<Pair<String, String>>) {
        appMap = entries.map {
            Pair(it.first.toLowerCase(Locale.getDefault()), it.second)
        }.toMap()

        unstoppedAppMap = appMap.entries.groupBy(
            keySelector = { language.stripStopwords(it.key) },
            valueTransform = { it.key }
        )
    }

    private fun buildAppMap(context: Context) {
        buildAppMap(context.packageManager.let { pm ->
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
                        pm.getApplicationLabel(pm.getApplicationInfo(packageName, 0)).toString(),
                        packageName
                    )
                } else {
                    null
                }
            }
        })
    }
}
