package mozilla.voice.assistant.language

import mozilla.voice.assistant.intents.TomlException
import mozilla.voice.assistant.intents.TomlParser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class TomlParserTest {
    lateinit var parser: TomlParser

    @BeforeEach
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
                TomlParser.unquotedSingleLineStringRegex.matchEntire(it),
                "Problem matching /$it/"
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
    fun testParseSimpleTable() {
        parser.parse(SIMPLE_TABLE_TEST_STRING)
        assertTrue(parser.tables.containsKey("tableName"))
        parser.getTable("tableName")?.let {
            assertEquals("value1", it["key1"])
            assertEquals("value2", it["key2"])
            assertEquals("value3", it["key3"])
            assertEquals(" value 4", it["key 4"])
        } ?: throw Error("Unable to get table 'tableName'")
    }

    @Test
    fun testGetStringSimpleTable() {
        parser.parse(SIMPLE_TABLE_TEST_STRING)
        assertEquals("value1", parser.getString("tableName.key1"))
        assertEquals("value2", parser.getString("tableName.key2"))
        assertEquals("value3", parser.getString("tableName.key3"))
        assertEquals(" value 4", parser.getString("tableName.key 4"))
    }

    @Test
    fun testGetStringBadArgument() {
        listOf(
            "onefield",
            "no dots"
        ).forEach {
            assertThrows(TomlException::class.java) {
                parser.getString(it)
            }
        }
        assertNull(parser.getString("foo.bar")) // legal string, not in table
    }

    @Test
    fun testParseComplexTable() {
        parser.parse(TABLE_LIST_TEST_STRING)
        parser.getTable("alarm.setAbsolute")?.let {
            assertEquals(2, it.size)
            assertEquals("Set an alarm for the specified time", it["description"])
            it["match"]?.trim()?.let {
                assertTrue(
                    it.startsWith("set alarm") && it.endsWith("[period=pm]"),
                        "Unexpected value for it['match']: /$it/"
                )
            } ?: throw Error("Unable to find alarm.setAbsolute.match")
        } ?: throw Error("Unable to find table 'alarm.setAbsolute'")
        parser.tableLists["alarm.setAbsolute.example"]?.let { tableList ->
            assertEquals(3, tableList.size)
            for (i in tableList.indices) {
                assertEquals(ABSOLUTE_EXAMPLE_STRINGS[i], tableList[i]["phrase"])
            }
        } ?: throw Error("Unable to find table list 'alarm.setAbsolute.example")
        parser.getTable("alarm.setRelative")?.let {
            assertEquals(2, it.size)
            assertEquals(
                "Set an alarm for the specified offset from the current time",
                it["description"]
            )
            it["match"]?.trim()?.let {
                assertTrue(
                    it.startsWith("set alarm") && it.endsWith("from now"),
                    "Unexpected value for it['match']: /$it/"
                )
            } ?: throw Error("Unable to find alarm.setRelative.match")
        }
    }

    @Test
    fun testGetStringFromComplexInput() {
        parser.parse(TABLE_LIST_TEST_STRING)
        assertEquals(
            "Set an alarm for the specified time",
            parser.getString("alarm.setAbsolute.description")
        )
        parser.getString("alarm.setAbsolute.match")?.matches(
            Regex("set alarm.*\\[period=pm\\]")
        ) ?: throw Error("Unable to retrieve alarm.setAbsolute.match")
        assertEquals(
                "Set an alarm for the specified offset from the current time",
            parser.getString("alarm.setRelative.description")
        )
        parser.getString("alarm.setRelative.match")?.matches(
            Regex("set alarm.*from now")
        ) ?: throw Error("Unable to retrieve alarm.setRelative.match")
    }

    @Test
    fun testGetStringsFromComplexInput() {
        parser.parse(TABLE_LIST_TEST_STRING)
        assertEquals(
            ABSOLUTE_EXAMPLE_STRINGS,
            parser.getStrings("alarm.setAbsolute.example.phrase")
        )
        assertEquals(
            RELATIVE_EXAMPLE_STRINGS,
            parser.getStrings("alarm.setRelative.example.phrase")
        )

        @Test
        fun testGetTablesFromComplexInput() {
            parser.parse(TABLE_LIST_TEST_STRING)
            parser.getTables("alarm.setAbsolute.example")?.let { tableList ->
                assertEquals(3, tableList.size)
                for (i in tableList.indices) {
                    assertEquals(ABSOLUTE_EXAMPLE_STRINGS[i], tableList[i]["phrase"])
                }
            } ?: throw Error("Unable to find table list 'alarm.setAbsolute.example")
        }
    }

    companion object {
        private const val Q = '"'
        private const val QQQ = "$Q$Q$Q"

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

        private val ABSOLUTE_EXAMPLE_STRINGS = listOf(
            "Set alarm for 11:50 am",
            "Set alarm for 1",
            "Set alarm for midnight"
        )
        private val RELATIVE_EXAMPLE_STRINGS = listOf(
            "Set alarm for 1 hour from now",
            "Set alarm 90 minutes from now"
        )

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
            description = "Set an alarm for the specified offset from the current time"
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
