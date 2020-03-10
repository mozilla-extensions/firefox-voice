package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class AlternativesTest {
    private lateinit var language: Language

    @Before
    fun setup() {
        language = LanguageTest.getLanguage()
    }

    private fun word(source: String) = Word(source, language)

    @Test
    fun testWordVsNonEmptyWildcard() {
        val results = Alternatives(listOf(word("hello"), Wildcard(empty = false)))
            .matchUtterance(
                makeMatch("hello", language)
            )
        assertEquals(2, results.size)

        // One result should exhaust the utterance with the Word.
        val matchedWord = results.getOnly { it.capturedWords == 1 }
        checkCounts(matchedWord, capturedWords = 1) // everything else 0

        // One result should exhaust the utterance with the Wildcard.
        val matchedWildcard = results.getOnly { it.capturedWords == 0 }
        checkCounts(matchedWildcard)
    }

    @Test
    fun testWordVsEmptyWildcard() {
        val results = Alternatives(listOf(Word("hello", language), Wildcard(empty = true)))
            .matchUtterance(
                makeMatch("hello", language)
            )
        assertEquals(3, results.size)

        // One result should exhaust the utterance with the Word.
        val matchedWord = results.getOnly { it.capturedWords == 1 }
        checkCounts(matchedWord, capturedWords = 1) // everything else 0

        // One result should exhaust the utterance with the Wildcard.
        val matchedWildcard = results.getOnly { it.capturedWords == 0 && it.utteranceExhausted() }
        checkCounts(matchedWildcard)

        // One result should empty match the Wildcard and not be exhausted.
        val emptyWildcard = results.getOnly { !it.utteranceExhausted() }
        assertEquals(0, emptyWildcard.aliasedWords)
        assertEquals(0, emptyWildcard.capturedWords)
        assertEquals(0, emptyWildcard.skippedWords)
    }

    @Test
    fun testToSource() {
        assertEquals(
            "(bring | take)",
            Alternatives(
                listOf(word("bring"), word("take")),
                empty = false
            ).toSource()
        )

        assertEquals(
            "(bring | take | )",
            Alternatives(
                listOf(word("bring"), word("take")),
                empty = true
            ).toSource()
        )
    }
}
