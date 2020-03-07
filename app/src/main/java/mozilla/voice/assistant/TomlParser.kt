package mozilla.voice.assistant

import androidx.annotation.VisibleForTesting

/**
 * A parser for a subset of TOML.
 */
class TomlParser {
    companion object {
        internal val tableHeaderRegex = Regex("""\[([^\[\]]+)\]\s*((.|\s)*)""")
        private val tableListHeaderRegex = Regex("""\[\[([^\]]+)\]]\s*((.|\s)*)""")
        private const val Q = '"'
        private const val QQQ = "$Q$Q$Q"
        private const val QUOTED_STRING = """$Q(?:[^"]+)$Q""" // + to keep from matching """
        internal val quotedStringRegex = Regex(QUOTED_STRING)
        private const val UNQUOTED_SINGLE_LINE_STRING = """(?:[^=\s"]+)"""
        internal val unquotedSingleLineStringRegex  = Regex(UNQUOTED_SINGLE_LINE_STRING)
        private const val TRIPLE_QUOTED_STRING = """$QQQ(?:[^$Q]+)$QQQ"""
        internal val tripleQuotedStringRegex = Regex(TRIPLE_QUOTED_STRING)
        private val key = "($QUOTED_STRING|$UNQUOTED_SINGLE_LINE_STRING)"
        internal val keyRegex = Regex(key)
        private val value = "($QUOTED_STRING|$UNQUOTED_SINGLE_LINE_STRING|$TRIPLE_QUOTED_STRING)"
        internal val valueRegex = Regex(value)
        internal val keyValueRegex = Regex("""\s*$key\s*=\s*$value\s*((.|\s)*)""")
    }
    @VisibleForTesting
    internal val tables = mutableMapOf<String, TomlTable>()
    @VisibleForTesting
    internal val tableLists = mutableMapOf<String, TomlTableList>()

    internal fun populateTable(table: TomlTable, s: String): String {
        var toParse = s
        while (toParse.isNotEmpty() && !toParse.startsWith('[')) {
            keyValueRegex.matchEntire(toParse)?.run {
                val (key, value, rest) = destructured
                table[key.trim('"')] = value.trim('"')
                toParse = rest
            } ?: throw Error("Expected key-value pair: $toParse")
        }
        return toParse
    }

    internal fun parse(s: String) {
        var toParse = s.trim()
        while (toParse.isNotEmpty()) {
            if (toParse.startsWith("[") && toParse.length > 2 && toParse[1] != '[') {
                val table = mutableMapOf<String, String>()
                val results = tableHeaderRegex.matchEntire(toParse)
                check(results != null)
                val (tableName, rest) = results.destructured
                tables[tableName] = table
                toParse = populateTable(table, rest)
                continue
            }
            if (toParse.startsWith("[[")) {
                val table = mutableMapOf<String, String>()
                val (tableName, rest) = tableListHeaderRegex.matchEntire(toParse)?.destructured
                    ?: throw Error("Expected table list name")
                if (tableLists.contains(tableName)) {
                    tableLists[tableName]?.add(table) ?: throw Error("Invariant violated")
                } else {
                    tableLists[tableName] = mutableListOf(table)
                }
                toParse = populateTable(table, toParse)
                continue
            }
            throw Error("Cannot parse: $toParse")
        }
    }
}

typealias TomlTable = MutableMap<String, String>
typealias TomlTableList = MutableList<TomlTable>
