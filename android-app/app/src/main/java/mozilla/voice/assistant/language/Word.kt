package mozilla.voice.assistant.language

import androidx.annotation.VisibleForTesting
import java.util.Locale

private val nonAlphaNumRegex = Regex("[^a-z0-9]")
@VisibleForTesting
internal fun String.normalize() =
    toLowerCase(Locale.getDefault()).replace(nonAlphaNumRegex, "")

internal fun String.toWordList(language: Language) = trim()
    .split(Regex("\\s+"))
    .map { it.trim() }
    .filterNot { it.isEmpty() }
    .map { Word(it, language) }

/**
 * A representation of both a word in a user utterance and a word to match in a phrase.
 */
class Word(private val source: String, private val language: Language) : Pattern {
    private val word: String = source.normalize()
    private val aliases = language.getAliases(word)
    private val multiwordAliases: List<List<String>>? = language.getMultiwordAliases(word)
    internal val isStopWord = language.isStopword(word)

    private fun getMultiwordResults(match: MatchResult): List<MatchResult> {
        val results = mutableListOf<MatchResult>()

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
        if (otherWord.isStopWord) {
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

    override fun toString() =
        if (source == word) {
            "Word(\"$source\")"
        } else {
            "Word(\"$source\"->$word)"
        }

    override fun toSource() = source

    override fun slotNames() = emptySet<String>()

    override fun equals(other: Any?): Boolean = other is Word && other.word == word

    override fun hashCode() = word.hashCode()
}
