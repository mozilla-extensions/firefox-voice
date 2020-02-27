package mozilla.voice.assistant.language

/***
 * A representation of a pattern in our intent grammar.
 */
interface Pattern {
    /**
     * Determines the state of matching a user utterance after this pattern is applied to
     * unprocessed words.
     *
     * @param match the incoming state of the match
     * @return all resulting matches after applying this pattern
     */
    fun matchUtterance(match: MatchResult): List<MatchResult>

    /**
     * Provides a human-readable representation of the information used to create this pattern.
     *
     * @return a human-readable representation of the information used to create this pattern
     */
    fun toSource(): String

    /**
     * The names of any slots in this pattern, such as "query" in "search for [query]".
     *
     * @return the names of any slots
     */
    fun slotNames(): Set<String>
}
