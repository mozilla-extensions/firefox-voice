package mozilla.voice.assistant.language

import org.junit.Assert

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
    Assert.assertEquals(1, matches.size)
    return matches[0]
}

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
