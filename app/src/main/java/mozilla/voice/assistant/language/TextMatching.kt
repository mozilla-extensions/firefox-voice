package mozilla.voice.assistant.language

import java.util.Locale

fun String.normalize() =
    toLowerCase(Locale.getDefault()).replace("[^a-z0-9]", "")

// setUnions() is just Array.union
/*
fun String.toWordList() =
    trim().split("\\s+").map(Word(it))

class Word(val source: String) {
    val word = source.normalize()
    val aliases =
}
 */
