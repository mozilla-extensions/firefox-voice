package mozilla.voice.assistant.language

import android.content.Context
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class LanguageTest {
    private lateinit var language: Language

    @BeforeEach
    fun reset() {
        language = getLanguage("fee fie fum")
    }

    @Test
    fun testStopwords() {
        assertEquals(3, language.getStopwordsSize())
        assertTrue(language.isStopword("fee"))
        assertTrue(language.isStopword("fie"))
        assertTrue(language.isStopword("fum"))
        assertFalse(language.isStopword("bar"))
    }

    @Test
    fun testRemoveStopwords() {
        listOf(
            "fee fie washington post fum",
            "washington post fum",
            "washington fee post"
        ).map {
            assertEquals("washington post", language.stripStopwords(it))
        }
    }

    @Test
    fun testContainsStopwords() {
        listOf("one fee two", "fee fie foe fum", "fum fum bar").forEach {
            assertTrue(
                language.containsStopwords(it),
                "language.containsStopWords(\"$it\") should have returned true"
            )
        }
    }

    private fun testFailingAlias(alias: String) {
        assertThrows(java.lang.IllegalArgumentException::class.java) {
            language.addAlias(alias)
        }
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

    companion object {
        fun getLanguage(stopwords: String = ""): Language {
            val context = mockk<Context>()
            every { context.assets } returns null
            return Language(context).apply {
                addAllStopwords(listOf(stopwords))
            }
        }
    }
}
