package mozilla.voice.assistant.language

/**
 * The top-level parser of user utterances, named "PhraseSet" for consistency with the
 * extension's parser, on which it is based.
 */
class PhraseSet(
    private val matchPhrases: List<Pattern>,
    private val language: Language
) {
    /**
     * Parses the given [utterance], finding the best match. The best match is defined
     * as the one that makes least use of wildcards. For matches with equal numbers of
     * wildcards, this prefers the match was the fewest skipped stopwords. For equal
     * numbers of both, this prefers the match with the fewest alias substitutions.
     *
     * @param utterance the user utterance
     * @return the best match, or null if the utterance cannot be parsed
     */
    fun match(utterance: String): MatchResult? {
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
