package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class CompilerTest {
    @Test
    fun testCompilePhraseWithoutEntities() {
        // The below test was in the JS code.
        assertEquals(
            "FullPhrase(\"(bring me | take me | go | navigate | show me | open) (to | find | ) (page | ) [query:+]\")",
            Compiler.compile("(bring me | take me | go | navigate | show me | open) (to | find |) (page |) [query]").toString()
        )
    }

    @Test
    fun testCompilePhraseWithEntities() {
        assertEquals(
            "FullPhrase(\"translate (this | ) (page | tab | article | site | ) to [language:(Spanish | English)] (for me | )\")",
            Compiler.compile(
                "translate (this |) (page | tab | article | site |) to [language:lang] (for me |)",
                entities = Compiler.convertEntities(mapOf("lang" to listOf("Spanish", "English")))
            ).toString()
        )
    }

    @Test
    fun testCompileOptionalBits() {
        assertEquals(
            "FullPhrase(\"next (result | results)\")",
            Compiler.compile("next result{s}").toString()
        )
    }

    private fun match(utterance: String, phrase: String) =
        Compiler.compile(phrase).matchUtterance(MatchResult(string = utterance))

    @Test
    fun testBasicMatches1() {
        val phrase = "this [query] test"
        val results = match("this is test", phrase)
        assertEquals(1, results.size)
        assertEquals(
            "MatchResult(\"this is test^^\", slots: {query: \"is\"}, capturedWords: 2)",
            results[0].toString()
        )
    }

    @Test
    fun testBasicMatches2() {
        val phrase = "this [query] test"
        val results = match("this is 'not' test", phrase)
        assertEquals(1, results.size)
        assertEquals(
            "MatchResult(\"this is 'not' test^^\", slots: {query: \"is 'not'\"}, capturedWords: 2)",
            results[0].toString()
        )

        assertEquals(0, match("this test", phrase).size)
        assertEquals(0, match("this no is testy", phrase).size)
    }

    private fun verifyExpectedMatch(phrase: String, utterance: String, expectedString: String) {
        val results = Compiler.compile(phrase).matchUtterance(MatchResult(string = utterance))
        assertEquals("Expected 1 match for: $utterance", 1, results.size)
        assertEquals(expectedString, results[0].toString())
    }

    @Test
    fun testAlternativeMatches() {
        Language.clear()
        Language.addStopwords("my")
        val phrase = "(hi | hello) world"
        listOf(
            Pair("hello world", "MatchResult(\"hello world^^\", capturedWords: 2)"),
            Pair("hi world!!!", "MatchResult(\"hi world!!!^^\", capturedWords: 2)"),
            Pair("hello, my world", "MatchResult(\"hello, my world^^\", skippedWords: 1, capturedWords: 2)")
        ).forEach {
            verifyExpectedMatch(phrase, it.first, it.second)
        }
    }

    @Test
    fun testStopwords() {
        Language.clear()
        Language.addStopwords("me for please")
        val phrase = "(launch | open) (new |) (tab | page)"
        listOf(
            Pair("launch new tab", "MatchResult(\"launch new tab^^\", capturedWords: 3)"),
            Pair("open new tab for me", "MatchResult(\"open new tab for me^^\", skippedWords: 2, capturedWords: 3)"),
            Pair("for me open new tab", "MatchResult(\"for me open new tab^^\", skippedWords: 2, capturedWords: 3)")
        ).forEach {
            verifyExpectedMatch(phrase, it.first, it.second)
        }
    }

    @Test
    fun testAliases() {
        Language.clear()
        Language.addAlias("app = tab")
        verifyExpectedMatch(
            "(launch | open) (new |) (tab | page)",
            "open new app",
            "MatchResult(\"open new app^^\", aliasedWords: 1, capturedWords: 3)"
        )
    }

    @Test
    fun testMultiwordAliases() {
        Language.clear()
        Language.addAlias("\"up ward\" = \"upward\"")
        verifyExpectedMatch(
            "scroll upward",
            "scroll upward",
            "MatchResult(\"scroll upward^^\", capturedWords: 2)"
        )
        verifyExpectedMatch(
            "scroll upward",
            "scroll up ward",
            "MatchResult(\"scroll up ward^^\", aliasedWords: 2, capturedWords: 3)"
        )
    }
}
