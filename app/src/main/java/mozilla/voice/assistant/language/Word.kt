package mozilla.voice.assistant.language

import java.util.Locale

private fun String.normalize() =
    toLowerCase(Locale.getDefault()).replace("[^a-z0-9]", "")

// setUnions() is just Array.union

fun String.toWordList() = trim().split("\\s+").map { Word(it) }

class Word(val source: String) : Pattern {
    val word: String = source.normalize()
    val aliases = English.aliases(word)
    val multiwordAliases: List<List<String>>? = English.multiwordAliases(word)

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

        var results = mutableListOf<MatchResult>()
        val otherWord = match.utteranceWord()
        if (otherWord.isStopWord()) {
            results = matchUtterance(match.clone(addIndex = 1, addSkipped = 1)).toMutableList()
        }
        results.addAll(getMultiwordResults(match))

        // Start here
        return emptyList()
    }

    private fun isStopWord() = English.stopwords.contains(word)
}
