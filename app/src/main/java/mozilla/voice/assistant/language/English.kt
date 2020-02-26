package mozilla.voice.assistant.language

import android.content.Context
import androidx.annotation.VisibleForTesting

private fun <K, V> MutableMap<K, MutableList<V>>.add(key: K, value: V) =
    this[key]?.run {
        if (this.contains(value)) {
            throw Error("Redundant attempt to add $key -> $value")
        }
        add(value)
    } ?: set(key, mutableListOf(value))

class English {
    companion object {
        internal val _aliases: MutableMap<String, MutableList<String>> = mutableMapOf()
        internal val _multiwordAliases: MutableMap<String, MutableList<List<String>>> =
            mutableMapOf()
        internal val _stopwords: MutableSet<String> = mutableSetOf()

        internal fun aliases(s: String): List<String>? = _aliases[s]
        internal fun multiwordAliases(s: String): List<List<String>>? = _multiwordAliases[s]
        internal fun isStopword(word: String) = _stopwords.contains(word)

        @VisibleForTesting // exists for testing
        internal fun clear() {
            _aliases.clear()
            _multiwordAliases.clear()
            _stopwords.clear()
        }

        @VisibleForTesting // exists for testing
        internal fun getAliasesSize() = _aliases.size

        @VisibleForTesting // exists for testing
        internal fun getMultiwordAliasesSize() = _multiwordAliases.size

        @VisibleForTesting // exists for testing
        internal fun addStopword(s: String) = _stopwords.add(s)

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
            context.assets.openFd("raw/stopwords.txt").use {
                _stopwords.addAll(splitToSet(it.createInputStream().bufferedReader().readLines()))
            }
        }
    }
}
