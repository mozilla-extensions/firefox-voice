package mozilla.voice.assistant.language

import android.content.Context
import androidx.annotation.VisibleForTesting

private fun <K, V> MutableMap<K, MutableList<V>>.add(key: K, value: V) =
    this[key]?.run {
        add(value)
    } ?: set(key, mutableListOf(value))

class English {
    companion object {
        private var _aliases: MutableMap<String, MutableList<String>> = mutableMapOf()
        private var _multiwordAliases: MutableMap<String, MutableList<List<String>>> = mutableMapOf()
        internal lateinit var stopwords: Set<String>

        internal fun aliases(s: String) = _aliases[s] as List<String>

        internal fun multiwordAliases(s: String) = _multiwordAliases[s] as List<List<String>>

        @VisibleForTesting // exists for testing
        internal fun clear() {
            _aliases = mutableMapOf()
            _multiwordAliases = mutableMapOf()
        }

        @VisibleForTesting // exists for testing
        internal fun getAliasesSize() = _aliases.size

        @VisibleForTesting // exists for testing
        internal fun getMultiwordAliasesSize() = _multiwordAliases.size

        @VisibleForTesting
        internal fun addAlias(input: String) {
            val line = input.trim()
            if (!line.startsWith('#') && line.isNotEmpty()) {
                val fields = input.trim().split(' ')
                if (fields.size < 2) {
                    throw IllegalArgumentException("Error parsing this line from aliases.txt: $input")
                }
                val proper = fields[0]
                if (fields.size == 2) {
                    _aliases.add(proper, fields[1])
                } else {
                    _multiwordAliases.add(proper, fields.drop(1))
                }
            }
        }

        @VisibleForTesting
        internal fun splitToSet(lines: List<String>) =
            lines
                .map { it.trim() }
                .filterNot { it.isEmpty() }
                .filterNot { it.startsWith("#") }
                .flatMap { it.split(' ') }
                .toSet()

        internal fun initialize(context: Context) {
            context.assets.openFd("raw/aliases.txt").use {
                readLine()?.let { addAlias(it) }
            }
            stopwords = context.assets.openFd("raw/stopwords.txt").use {
                splitToSet(it.createInputStream().bufferedReader().readLines())
            }
        }
    }
}
