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
                entities = Compiler.convertEntities(mapOf("lang" to listOf("Spanish", "English")))).toString()
        )
    }

    @Test
    fun testCompileOptionalBits() {
        assertEquals(
            "FullPhrase(\"next (result | results)\")",
            Compiler.compile("next result{s}").toString()
        )
    }

    private fun match(utterance: String, phrase: String): List<MatchResult> =
        Compiler.compile(phrase).matchUtterance(MatchResult(utterance))

    @Test
    fun testMatchWord() {
        val results = match("this", "this")
        assertEquals(1, results.size)
    }

    @Test
    fun testBasicMatches() {
        val results = match("this is test", "this [query] test")
        assertEquals(1, results.size)
        assertEquals(
            "MatchResult(\"this is test^^\", slots: {query: \"is\"}, capturedWords: 2)",
            results[0].toString()
        )
    }
}
