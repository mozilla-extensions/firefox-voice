package mozilla.voice.assistant.language

import android.content.Context
import androidx.annotation.VisibleForTesting
import java.lang.IllegalArgumentException

private fun <K, V> MutableMap<K, MutableList<V>>.add(key: K, value: V) =
    this[key]?.run {
        if (this.contains(value)) {
            throw Error("Redundant attempt to add $key -> $value")
        }
        add(value)
    } ?: set(key, mutableListOf(value))

class Language(context: Context) {
    private val aliases: MutableMap<String, MutableList<String>> = mutableMapOf()
    private val multiwordAliases: MutableMap<String, MutableList<List<String>>> =
        mutableMapOf()
    private val stopwords: MutableSet<String> = mutableSetOf()

    internal fun getAliases(s: String): List<String>? = aliases[s]
    internal fun getMultiwordAliases(s: String): List<List<String>>? = multiwordAliases[s]
    internal fun isStopword(word: String) = stopwords.contains(word)

    init {
        var section: String? = null
        // While I could use the TOML parser, the file is simple enough to parse directly.
        context.assets?.open("langs/english.toml")?.run {
            bufferedReader()
                .readLines()
                .map { it.trim() }
                .filterNot { it.isEmpty() }
                .filterNot { it.startsWith("#") }
                .filterNot { it.startsWith("//") }
                .forEach { line ->
                    // Check for start of section
                    if (line.startsWith("[")) {
                        section = line.trim('[', ']')
                    } else {
                        when (section) {
                            "aliases" -> addAlias(line)
                            "stopwords" -> addStopwords(line)
                            null -> throw Error("Data encountered before section heading")
                            else -> throw Error("Unexpected section $section")
                        }
                    }
                }
        }
    }

    @VisibleForTesting
    internal fun addStopwords(line: String) {
        line.trim().split(spacesRegex).forEach() { stopwords.add(it) }
    }

    @VisibleForTesting
    internal fun addAlias(line: String) {
        val fields = line.trim().split("=").map { it.trim(' ', '"') }
        if (fields.size != 2) {
            throw IllegalArgumentException("Illegal line in [aliases] section: $line")
        }
        // Remove optional quotation marks from each side.
        val alias = fields[0]
        val proper = fields[1]
        if (alias.contains(' ')) {
            multiwordAliases.add(proper, alias.split(' '))
        } else {
            aliases.add(proper, alias)
        }
    }

    // The below methods exist only for testing.

    @VisibleForTesting // exists for testing
    internal fun getAliasesSize() = aliases.size

    @VisibleForTesting // exists for testing
    internal fun getMultiwordAliasesSize() = multiwordAliases.size

    @VisibleForTesting // exists for testing
    internal fun getStopwordsSize() = stopwords.size

    companion object {
        private val spacesRegex = Regex("""\s+""")
    }
}
