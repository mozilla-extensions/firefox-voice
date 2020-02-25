package mozilla.voice.assistant.language

import android.content.Context
import androidx.annotation.VisibleForTesting

private fun MutableMap<String, MutableList<String>>.add(key: String, value: String) =
    this[key]?.run {
        add(value)
    } ?: set(key, mutableListOf(value))

class English {
    companion object {
        internal val aliases = mutableMapOf<String, MutableList<String>>()
        internal val multiwordAliases = mutableMapOf<String, MutableList<String>>()
        internal lateinit var stopwords: Set<String>

        @VisibleForTesting
        internal fun addAlias(input: String) {
            val line = input.trim()
            if (!line.startsWith('#') && line.isNotEmpty()) {
                val fields = input.trim().split(' ', limit = 3)
                if (fields.size < 2) {
                    throw IllegalArgumentException("Error parsing this line from aliases.txt: $input")
                }
                val proper = fields[0]
                if (fields.size == 2) {
                    aliases.add(proper, fields[1])
                } else {
                    multiwordAliases.add(proper, "${fields[1]} ${fields[2]}")
                }
            }
        }

        @VisibleForTesting
        internal fun splitToSet(lines: List<String>) =
            lines.map { it.trim() }.flatMap {
                if (it.startsWith('#') || it.isEmpty()) {
                    emptyList()
                } else {
                    it.trim().split(' ')
                }
            }.toSet()

        fun initialize(context: Context) {
            context.assets.openFd("raw/aliases.txt").use {
                readLine()?.let { addAlias(it) }
            }
            stopwords = context.assets.openFd("raw/stopwords.txt").use {
                splitToSet(it.createInputStream().bufferedReader().readLines())
            }
        }
    }
}
