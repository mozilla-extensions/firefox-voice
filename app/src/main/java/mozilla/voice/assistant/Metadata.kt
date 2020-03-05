package mozilla.voice.assistant

import android.content.Context
import android.content.Intent
import androidx.annotation.VisibleForTesting
import java.util.Locale
import net.consensys.cava.toml.Toml
import net.consensys.cava.toml.TomlArray
import net.consensys.cava.toml.TomlParseResult
import net.consensys.cava.toml.TomlTable

class Metadata {
    companion object {
        private var initialized = false
        private val metadata = mutableMapOf<String, TomlParseResult>()
        private lateinit var appMap: Map<String, String>
        internal fun getAppNames() = appMap.keys
        internal fun getPackageForAppName(appName: String) = appMap[appName.toLowerCase(Locale.getDefault())]

        private fun getToml(intentName: String): TomlParseResult =
            metadata[intentName.substringBefore('.')]
                ?: throw Error("Unable to get TOML for $intentName")

        private fun getTomlString(intentName: String, fieldName: String) =
            getToml(intentName).getString("$intentName.$fieldName")
                ?: throw Error("Unable to get $fieldName for $intentName")

        internal fun getDescription(intentName: String): String =
            getTomlString(intentName, "description")

        internal fun getExamples(intentName: String): List<String> {
            val examples: TomlArray = getToml(intentName).let {
                it.getArray("$intentName.example") ?: it.getArray("$intentName.examples")
                ?: throw Error("Unable to get examples for $intentName")
            }
            val tables: List<TomlTable> =
                examples.toList() as? List<TomlTable> ?: throw error("Error parsing TOML")

            return tables.map { table: TomlTable ->
                table.getString("phrase") ?: "Unable to get example phrase for $intentName"
            }
        }

        internal fun getPhrases(intentName: String): List<String> =
            getTomlString(intentName, "match").trim().split('\n', '\r')

        private fun addResult(intentName: String, result: TomlParseResult) {
            if (result.hasErrors()) {
                throw Error("Errors parsing $intentName: ${result.errors()}")
            }
            metadata[intentName] = result
        }

        @VisibleForTesting // exists for testing
        internal fun initializeForTest(intentName: String, tomlInput: String) {
            require(!initialized)
            addResult(intentName, Toml.parse(tomlInput))
            initialized = true
        }

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
                                    Locale.getDefault()),
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
                    addResult(it.split('.')[0], Toml.parse(context.assets.open(it)))
                }
            }
            initialized = true
        }
    }
}
