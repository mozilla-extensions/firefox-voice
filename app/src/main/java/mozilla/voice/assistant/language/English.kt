package mozilla.voice.assistant.language

import android.content.Context
import androidx.annotation.VisibleForTesting

fun String.stripComment() =
    replace("#.*$", "")

fun MutableMap<String, MutableList<String>>.add(key: String, value: String) =
    this[key]?.run {
        add(value)
    } ?: set(key, mutableListOf(value))

class English {

    companion object {
        val aliases = mutableMapOf<String, MutableList<String>>()
        val multiwordAliases = mutableMapOf<String, MutableList<String>>()
        val stopwords = mutableSetOf<String>()

        @VisibleForTesting
        internal fun addAlias(input: String) {
            if (!input.trim().startsWith('#')) {
                val fields = input.trim().split(' ', limit = 3)
                if (fields.size < 2 || fields.size > 3) {
                    throw Error("Error parsing this line from aliases.txt: $input")
                }
                val proper = fields[0]
                if (fields.size == 2) {
                    aliases.add(proper, fields[1])
                } else {
                    multiwordAliases.add(proper, "${fields[1]} ${fields[2]}")
                }
            }
        }

        fun initialize(context: Context) {
            context.assets.openFd("raw/aliases.txt").use {
                readLine()?.let { addAlias(it) }
            }
            context.assets.openFd("raw/stopwords.txt").createInputStream().bufferedReader().useLines {


            }
        }
    }
}