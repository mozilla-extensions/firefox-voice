package mozilla.voice.assistant.language

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue

internal fun String.toWordList(language: Language) =
    trim().let {
        if (it.isEmpty()) {
            emptyList()
        } else {
            it.split(' ').map { word -> Word(word, language) }
        }
    }

internal fun makeMatch(s: String, language: Language) =
    MatchResult(utterance = s.toWordList(language))

internal fun List<MatchResult>.getOnly(pred: (MatchResult) -> Boolean): MatchResult {
    val matches = this.filter(pred)
    assertEquals(1, matches.size)
    return matches[0]
}

internal fun checkCounts(
    match: MatchResult,
    aliasedWords: Int = 0,
    capturedWords: Int = 0,
    skippedWords: Int = 0
) {
    assertTrue(match.utteranceExhausted(), "match not exhausted: $match")
    assertEquals(
        aliasedWords,
        match.aliasedWords,
        "unexpected value for aliasedWords "
    )
    assertEquals(
        capturedWords,
        match.capturedWords,
        "unexpected value for capturedWords: "
    )
    assertEquals(
        skippedWords,
        match.skippedWords,
        "unexpected value for skippedWords: "
    )
}
