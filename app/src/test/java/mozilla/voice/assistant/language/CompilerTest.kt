package mozilla.voice.assistant.language

import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class CompilerTest {
    @Test
    fun testJavascriptTest1() {
        // The below test was in the JS code.
        assertEquals(
            "FullPhrase(\"(bring me | take me | go | navigate | show me | open) (to | find | ) (page | ) [query:+]\")",
            Compiler.compile("(bring me | take me | go | navigate | show me | open) (to | find |) (page |) [query]").toString()
        )
    }
}
