package mozilla.voice.assistant.language

/**
 * An implementation of match prioritization: choosing the match that makes the least use of
 * wildcards. For equal number of wildcards, this chooses the match with the fewest
 * skipped stopwords. For equal number of both, the match that uses the fewest alias
 * substitutions.
 */
class PhraseSet(private val matchPhrases: List<Pattern>, private val language: Language) {
    internal fun match(utterance: String): MatchResult? {
        val matchUtterance = MatchResult(utterance.toWordList(language))
        val allMatches = matchPhrases.flatMap { it.matchUtterance(matchUtterance) }
        return if (allMatches.isEmpty()) {
            null
        } else {
            allMatches.maxWith(
                compareBy<MatchResult> { it.capturedWords }
                    .thenBy { -it.skippedWords }
                    .thenBy { -it.aliasedWords }
            )
        }
    }
}
