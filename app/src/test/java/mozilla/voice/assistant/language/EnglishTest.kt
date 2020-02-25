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
        English.aliases.clear()
        English.multiwordAliases.clear()
    }

    @Test
    fun testIgnoreLines() {
        addAlias("# This is a comment.")
        addAlias("   # so is this  ")
        addAlias("")
        addAlias("  ")
        assertEquals(0, English.aliases.size)
        assertEquals(0, English.multiwordAliases.size)
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
        assertEquals(listOf("bonjour", "hola"), English.aliases["hello"])
        assertEquals(listOf("ciao"), English.aliases["goodbye"])
        assertEquals(2, English.aliases.keys.size)
        assertEquals(0, English.multiwordAliases.size)
    }

    @Test
    fun testMultiWordAliases() {
        addAlias("numbers one two three")
        addAlias("numbers four five")
        addAlias("letters alpha beta")
        assertEquals(listOf("one two three", "four five"), English.multiwordAliases["numbers"])
        assertEquals(listOf("alpha beta"), English.multiwordAliases["letters"])
        assertEquals(0, English.aliases.keys.size)
        assertEquals(2, English.multiwordAliases.size)
    }

    @Test
    fun testSplitToSet() {
        assertEquals(0, splitToSet(emptyList()).size)
        assertEquals(0, splitToSet(listOf(" # ignore me", "  ")).size)
        val set = splitToSet(listOf(
            "  hello world",
            "#ignore me",
            "hello again"
        ))
        assertEquals(setOf("hello", "world", "again"), set)
    }
}
