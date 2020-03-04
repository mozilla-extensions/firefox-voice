package mozilla.voice.assistant

import android.content.Context
import androidx.annotation.VisibleForTesting
import net.consensys.cava.toml.Toml
import net.consensys.cava.toml.TomlArray
import net.consensys.cava.toml.TomlParseResult
import net.consensys.cava.toml.TomlTable

class Metadata {
    companion object {
        private val metadata = mutableMapOf<String, TomlParseResult>()

        private fun getToml(intentName: String): TomlParseResult =
            metadata[intentName.substringBefore('.')] ?: throw Error("Unable to get TOML for $intentName")

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
            val tables: List<TomlTable> = examples.toList() as List<TomlTable>

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
            addResult(intentName, Toml.parse(tomlInput))
        }

        internal fun initialize(context: Context) {
            context.assets.list("raw/").forEach {
                if (it.contains(".toml")) {
                    addResult(it.split('.')[0], Toml.parse(context.assets.open(it)))
                }
            }
        }
    }
}
