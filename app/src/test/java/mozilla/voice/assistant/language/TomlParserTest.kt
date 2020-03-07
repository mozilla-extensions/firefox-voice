package mozilla.voice.assistant.language

import mozilla.voice.assistant.TomlParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class TomlParserTest {
    lateinit var parser: TomlParser

    @Before
    fun setup() {
        parser = TomlParser()
    }

    private fun testNone(s: String) {
        parser.parse(s)
        assertEquals(0, parser.tables.size)
        assertEquals(0, parser.tableLists.size)
    }

    @Test
    fun parseNoText() {
        testNone("")
        testNone("   ")
        testNone(" \n \r \n")
    }

    @Test
    fun testTableHeaderRegex() {
        listOf(
            """[tableName]
            key1 = value1
            "key2" = "value2"
        """.trimIndent(),
            """[tableName]
            key1 = value1
        """.trimIndent(),
            """[tableName]
            key1 = value1
            
            """.trimIndent(),
            """[tableName]
            key1 = value1""".trimIndent()
        ).forEach { assertNotNull(TomlParser.tableHeaderRegex.matchEntire(it)) }
    }

    @Test
    fun testQuotedStringRegex() {
        quotedKeys.forEach { assertNotNull(TomlParser.quotedStringRegex.matchEntire(it)) }

        listOf(
            "\"hello",
            "hello world"
        ).forEach { assertNull(TomlParser.quotedStringRegex.matchEntire(it)) }
    }

    @Test
    fun testUnquotedSingleLineStringRegex() {
        simpleKeys.forEach {
            assertNotNull(
                "Problem matching /$it/",
                TomlParser.unquotedSingleLineStringRegex.matchEntire(it)
            )
        }
    }

    @Test
    fun testTripleQuotedStringRegex() {
        tripleQuotedKeys.forEach { TomlParser.tripleQuotedStringRegex.matchEntire(it) }
    }

    private fun testKey(key: String) {
        TomlParser.keyRegex.matchEntire(key)?.run {
            val (extractedKey) = destructured
            assertEquals(key, extractedKey)
        } ?: throw error("Unable to parse key /$key/")
    }

    private fun testValue(value: String) {
        TomlParser.valueRegex.matchEntire(value)?.run {
            val (extractedValue) = destructured
            assertEquals(value, extractedValue)
        } ?: throw error("Unable to parse value /$value/")
    }

    private fun keyValueHelper(key: String, value: String) {
        testKey(key)
        testValue(value)
        val line = "$key = $value"
        TomlParser.keyValueRegex.matchEntire(line)?.run {
            val (extractedKey, extractedValue) = destructured
            assertEquals(value, extractedValue)
            assertEquals(key.trim('"'), extractedKey.trim('"'))
        } ?: throw Error("Unable to parse key-value pair: /$line/")
        val table = mutableMapOf<String, String>()
        val rest = parser.populateTable(table, line)
        assertTrue(rest.isEmpty())
        assertEquals(1, table.size)
        assertTrue(table.containsKey(key.trim('"')))
        assertEquals(value.trim('"'), table[key.trim('"')])
    }

    @Test
    fun testKeyValueRegex() {
        keyValueHelper("key1", "value1")
        keyValueHelper("\"key 2\"", "$QQQ$multilineValue$QQQ")
        keyValueHelper("\"key 4\"", """$QQQ value 4$QQQ""".trimIndent())
    }

    @Test
    fun parseSimpleTable() {
        parser.parse(SIMPLE_TABLE_TEST_STRING)
        assertTrue(parser.tables.containsKey("tableName"))
        parser.tables["tableName"]?.let {
            assertEquals("value1", it["key1"])
            assertEquals("value2", it["key2"])
            assertEquals("value3", it["key3"])
            assertEquals(" value 4", it["key 4"])
        }
    }

    @Test
    fun parseComplexTable() {
        parser.parse(TABLE_LIST_TEST_STRING)
        parser.tables["alarm.setAbsolute"]?.let {
            assertEquals(2, it.size)
            assertEquals("Set an alarm for the specified time", it["description"])
            assertTrue(it.containsKey("match"))
        } ?: throw Error("Unable to find table 'alarm.setAbsolute'")
    }

    companion object {
        private const val Q = '"'
        private const val QQQ = "\"\"\""
        private val simpleKeys = listOf("f", "foo")
        private val quotedKeys = listOf("k", "key", "foo bar").map { "\"$it\"" }
        private val tripleQuotedKeys = listOf(
            "foo", "foo bar", "foo bar\nbaz"
        ).map { "\"\"\"$it\"\"\"" }
        private const val multilineValue = """
            foo
            bar
        """

        private val SIMPLE_TABLE_TEST_STRING = """
            [tableName]
            key1 = value1 #ignore me
            "key2" = "value2"
            # I'm a full-line comment.
            key3=value3
            "key 4" = $QQQ value 4$QQQ""".trimIndent()

        private val TABLE_LIST_TEST_STRING = """
            [alarm.setAbsolute]
            description = "Set an alarm for the specified time"
            match = ""${'"'}
                set alarm (for|to) [hour:number]
                set alarm (for|to) [hour:number] a.m [period=am]
                set alarm (for|to) [hour:number] p.m [period=pm]
            ""${'"'}

        [[alarm.setAbsolute.example]]
        phrase = "Set alarm for 11:50 am"

        [[alarm.setAbsolute.example]]
        phrase = "Set alarm for 1"

        [[alarm.setAbsolute.example]]
        phrase = "Set alarm for midnight"

        [alarm.setRelative]
        description = "Set an alarm for the specified time"
        match = ""${'"'}
            set alarm (for|to| ) [hour:number] (hours|hour) from now
            set alarm (for|to| ) [minute:number] (minutes|minute) from now
            set alarm (for|to| ) [hour:number] (hours|hour) [minute:number] (minutes|minute) from now
        ""${'"'}

        [[alarm.setRelative.example]]
        phrase = "Set alarm for 1 hour from now"

        [[alarm.setRelative.example]]
        phrase = "Set alarm 90 minutes from now"
        """.trimIndent()
    }
}
