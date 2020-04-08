package mozilla.voice.assistant.language

import android.content.Context
import androidx.annotation.VisibleForTesting
import java.lang.IllegalArgumentException
import mozilla.voice.assistant.intents.TomlException

private fun <K, V> MutableMap<K, MutableList<V>>.add(key: K, value: V) =
    this[key]?.run {
        if (this.contains(value)) {
            throw IllegalArgumentException("Redundant attempt to add $key -> $value")
        }
        add(value)
    } ?: set(key, mutableListOf(value))

class Language(context: Context) {
    private val aliases: MutableMap<String, MutableList<String>> = mutableMapOf()
    private val multiwordAliases: MutableMap<String, MutableList<List<String>>> =
        mutableMapOf()
    // These are initialized in addAllStopwords().
    private lateinit var stopwords: List<String>
    private lateinit var stopwordsRegex: Regex

    internal fun getAliases(s: String): List<String>? = aliases[s]
    internal fun getMultiwordAliases(s: String): List<List<String>>? = multiwordAliases[s]
    internal fun isStopword(word: String) = stopwords.contains(word)

    init {
        val stopwordLines = mutableSetOf<String>()
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
                            "stopwords" -> stopwordLines.add(line)
                            null -> throw TomlException("Data encountered before section heading")
                            else -> throw TomlException("Unexpected section $section")
                        }
                    }
                }
            addAllStopwords(stopwordLines)
        }
    }

    // This should be called exactly once, either from init (for real execution)
    // or from a test method.
    @VisibleForTesting
    internal fun addAllStopwords(lines: Collection<String>) {
        stopwords = lines.flatMap {
            it.trim().split(spacesRegex)
        }
        stopwordsRegex = Regex(stopwords.joinToString(separator = "|"))
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

    internal fun stripStopwords(s: String) =
        s.replace(stopwordsRegex, "")
            .replace(spacesRegex, " ")
            .trim()

    internal fun containsStopwords(s: String) = stopwordsRegex.find(s) != null

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
