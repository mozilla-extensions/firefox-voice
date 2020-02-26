package mozilla.voice.assistant.language

import java.util.Locale

private fun String.normalize() =
    toLowerCase(Locale.getDefault()).replace("[^a-z0-9]", "")

// setUnions() is just Array.union

fun String.toWordList() = trim().split("\\s+").map { Word(it) }

class Word(val source: String) : Pattern {
    private val word: String = source.normalize()
    private val aliases = English.aliases(word)
    private val multiwordAliases: List<List<String>>? = English.multiwordAliases(word)

    private fun getMultiwordResults(match: MatchResult): List<MatchResult> {
        var results = mutableListOf<MatchResult>()

        multiwordAliases?.forEach() { alias: List<String> ->
            var multiwordResult: MatchResult? = match
            for (word in alias) {
                if (multiwordResult != null && !multiwordResult.utteranceExhausted() && multiwordResult.utteranceWord().word == word) {
                    multiwordResult = multiwordResult.clone(addIndex = 1, addWords = 1, addAliased = 1)
                } else {
                    multiwordResult = null
                    break
                }
            }
            multiwordResult?.let { results.add(it) }
        }
        return results.toList()
    }

    override fun matchUtterance(match: MatchResult): List<MatchResult> {
        if (word.isEmpty()) {
            return listOf(match)
        }
        if (match.utteranceExhausted()) {
            return emptyList()
        }

        val results = mutableListOf<MatchResult>()
        val otherWord = match.utteranceWord()
        if (otherWord.isStopWord()) {
            results.addAll(matchUtterance(match.clone(addIndex = 1, addSkipped = 1)).toMutableList())
        }

        results.addAll(getMultiwordResults(match))

        if (otherWord.word == word) {
            val nextMatch = match.clone(addIndex = 1, addWords = 1)
            results.add(nextMatch)
            if (!nextMatch.utteranceExhausted() && nextMatch.utteranceWord().word == word) {
                // A repeated word, which we'll ignore
                results.add(nextMatch.clone(addIndex = 1, addSkipped = 1))
            }
        } else if (aliases != null && aliases.contains(otherWord.word)) {
            results.add(match.clone(addIndex = 1, addWords = 1, addAliased = 1))
        }

        return results
    }

    private fun isStopWord() = English.isStopword(word)

    override fun toString() =
        if (source == word) {
            "Word(\"$source\")"
        } else {
            "Word(\"$source\"->$word)"
        }

    override fun toSource() = source

    override fun slotNames() = emptySet<String>()
}
