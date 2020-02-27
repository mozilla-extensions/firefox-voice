package mozilla.voice.assistant.language

import org.junit.Assert

internal fun makeMatch(s: String) =
    MatchResult(
        utterance = s.trim().let {
            if (it.isEmpty()) {
                emptyList()
            } else {
                it.split(' ').map { word -> Word(word) }
            }
        }
    )

internal fun checkCounts(
    match: MatchResult,
    aliasedWords: Int = 0,
    capturedWords: Int = 0,
    skippedWords: Int = 0
) {
    Assert.assertTrue("match not exhausted: $match", match.utteranceExhausted())
    Assert.assertEquals(
        "unexpected value for aliasedWords: ",
        aliasedWords,
        match.aliasedWords
    )
    Assert.assertEquals(
        "unexpected value for capturedWords: ",
        capturedWords,
        match.capturedWords
    )
    Assert.assertEquals(
        "unexpected value for skippedWords: ",
        skippedWords,
        match.skippedWords
    )
}
