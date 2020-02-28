package mozilla.voice.assistant.language

import mozilla.voice.assistant.language.Language.Companion.addAlias
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class LanguageTest {
    @Before
    fun reset() {
        Language.clear()
    }

    @Test
    fun testAddStopwords() {
        Language.addStopwords("fee fie fum")
        assertEquals(3, Language.getStopwordsSize())
        assertTrue(Language.isStopword("fee"))
        assertTrue(Language.isStopword("fie"))
        assertTrue(Language.isStopword("fum"))
        assertFalse(Language.isStopword("bar"))
    }

    private fun testFailingAlias(alias: String) {
        try {
            addAlias(alias)
            fail("There should have been an error when this was passed to addAlias(): $alias")
        } catch (_: IllegalArgumentException) {}
    }

    @Test
    fun testBadLines() {
        listOf(
            "noequals",
            "foo=bar=baz",
            "foo \"bar\""
        ).forEach { testFailingAlias(it) }
    }

    @Test
    fun testSingleWordAliases() {
        addAlias("bonjour = \"hello\"")
        addAlias("\"hola\" = hello")
        addAlias("ciao=\"goodbye\"")
        assertEquals(listOf("bonjour", "hola"), Language.getAliases("hello"))
        assertEquals(listOf("ciao"), Language.getAliases("goodbye"))
        assertEquals(2, Language.getAliasesSize())
        assertEquals(0, Language.getMultiwordAliasesSize())
    }

    @Test
    fun testMultiWordAliases() {
        addAlias("\"down word\" = downward")
        addAlias("\"down ward\" = \"downward\"")
        addAlias("town ward =downward")
        addAlias("\"town word\"=\"downward\"")
        assertEquals(listOf(
            listOf("down", "word"),
            listOf("down", "ward"),
            listOf("town", "ward"),
            listOf("town", "word")
        ), Language.getMultiwordAliases("downward"))
        assertEquals(0, Language.getAliasesSize())
        assertEquals(1, Language.getMultiwordAliasesSize())
    }
}
