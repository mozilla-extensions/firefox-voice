package mozilla.voice.assistant.language

import android.content.Context
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.junit.MockitoJUnitRunner

@RunWith(MockitoJUnitRunner::class)
class LanguageTest {
    private lateinit var language: Language

    companion object {
        fun getLanguage(): Language {
            val context = mock(Context::class.java)
            `when`(context.assets).thenReturn(null)
            return Language(context)
        }
    }

    @Before
    fun reset() {
        language = getLanguage()
    }

    @Test
    fun testAddStopwords() {
        language.addStopwords("fee fie fum")
        assertEquals(3, language.getStopwordsSize())
        assertTrue(language.isStopword("fee"))
        assertTrue(language.isStopword("fie"))
        assertTrue(language.isStopword("fum"))
        assertFalse(language.isStopword("bar"))
    }

    private fun testFailingAlias(alias: String) {
        try {
            language.addAlias(alias)
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
        language.addAlias("bonjour = \"hello\"")
        language.addAlias("\"hola\" = hello")
        language.addAlias("ciao=\"goodbye\"")
        assertEquals(listOf("bonjour", "hola"), language.getAliases("hello"))
        assertEquals(listOf("ciao"), language.getAliases("goodbye"))
        assertEquals(2, language.getAliasesSize())
        assertEquals(0, language.getMultiwordAliasesSize())
    }

    @Test
    fun testMultiWordAliases() {
        language.addAlias("\"down word\" = downward")
        language.addAlias("\"down ward\" = \"downward\"")
        language.addAlias("town ward =downward")
        language.addAlias("\"town word\"=\"downward\"")
        assertEquals(listOf(
            listOf("down", "word"),
            listOf("down", "ward"),
            listOf("town", "ward"),
            listOf("town", "word")
        ), language.getMultiwordAliases("downward"))
        assertEquals(0, language.getAliasesSize())
        assertEquals(1, language.getMultiwordAliasesSize())
    }
}
