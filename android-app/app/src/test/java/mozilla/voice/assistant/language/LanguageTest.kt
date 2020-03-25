package mozilla.voice.assistant.language

import android.content.Context
import io.mockk.every
import io.mockk.junit5.MockKExtension
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(MockKExtension::class)
class LanguageTest {
    private lateinit var language: Language

    companion object {
        fun getLanguage(): Language {
            val context = mockk<Context>()
            every { context.assets } returns null
            return Language(context)
        }
    }

    @BeforeEach
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

    @Test
    fun testRemoveStopwords() {
        language.addStopwords("please show me the")
        listOf(
            "please please show me the washington post",
            "washington show post",
            "washington post please show me"
        ).map {
            assertEquals("washington post", language.stripStopwords(it))
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
}
