package mozilla.voice.assistant.language

import mozilla.voice.assistant.language.English.Companion.addAlias
import mozilla.voice.assistant.language.English.Companion.splitToSet
import org.junit.Assert.assertEquals
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class EnglishTest {
    @Before
    fun reset() {
        English.clear()
    }

    @Test
    fun testIgnoreLines() {
        addAlias("# This is a comment.")
        addAlias("   # so is this  ")
        addAlias("")
        addAlias("  ")
        assertEquals(0, English.getAliasesSize())
        assertEquals(0, English.getMultiwordAliasesSize())
    }

    private fun testFailingAlias(alias: String) {
        try {
            addAlias(alias)
            fail("There should have been an error when this was passed to addAlias(): $alias")
        } catch (_: IllegalArgumentException) {}
    }

    @Test
    fun testBadLines() {
        testFailingAlias("onesection")
    }

    @Test
    fun testSingleWordAliases() {
        addAlias("hello bonjour")
        addAlias("hello hola")
        addAlias("goodbye ciao")
        assertEquals(listOf("bonjour", "hola"), English.aliases("hello"))
        assertEquals(listOf("ciao"), English.aliases("goodbye"))
        assertEquals(2, English.getAliasesSize())
        assertEquals(0, English.getMultiwordAliasesSize())
    }

    @Test
    fun testMultiWordAliases() {
        addAlias("numbers one two three")
        addAlias("numbers four five")
        addAlias("letters alpha beta")
        assertEquals(listOf(listOf("one", "two", "three"), listOf("four", "five")), English.multiwordAliases("numbers"))
        assertEquals(listOf(listOf("alpha", "beta")), English.multiwordAliases("letters"))
        assertEquals(0, English.getAliasesSize())
        assertEquals(2, English.getMultiwordAliasesSize())
    }

    @Test
    fun testSplitToSet() {
        assertEquals(0, splitToSet(emptyList()).size)
        assertEquals(0, splitToSet(listOf("#ignore me")).size)
        assertEquals(0, splitToSet(listOf("  #ignore me")).size)
        assertEquals(0, splitToSet(listOf("  ")).size)
        val set = splitToSet(listOf(
            "  hello world",
            "#ignore me",
            "hello again"
        ))
        assertEquals(setOf("hello", "world", "again"), set)
    }
}
