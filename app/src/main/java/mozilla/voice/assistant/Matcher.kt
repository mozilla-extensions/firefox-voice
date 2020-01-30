package mozilla.voice.assistant

class Matcher(
    private val phrase: String,
    private val slots: List<String>, // names of slots
    private val slotTypes: Map<String, String>,
    private val parameters: Map<String, String>,
    private val regexString: String
) {
    private val regex = Regex("^$regexString$", RegexOption.IGNORE_CASE)
}

class MatcherBuilder(
    private val phrase: String
) {
    private val parameterRegex = Regex("\\[(\\w+)=(\\w+)](.*)")
    private val untypedSlotRegex = Regex("\\[(\\w+)\\](.*)")
    private val typedSlotRegex = Regex("\\[(\\w+):(\\w+)\\](.*)")
    private val alternativesRegex = Regex("\\([^)]+\\)(.*)")
    private val wordsRegex = Regex("([^\\(\\[]*)(.*)")

    private val slots = mutableListOf<String>()
    private val slotTypes = mutableMapOf<String, String>()
    private val parameters = mutableMapOf<String, String>()
    private var regexBuilder = StringBuilder()

    fun build(): Matcher? {
        if (phrase.isEmpty()) {
            return null
        }
        return parse(phrase)
    }

    private fun parse(toParse: String): Matcher {
        if (toParse.isEmpty()) {
            return Matcher(
                phrase,
                slots,
                slotTypes,
                parameters,
                regexBuilder.replace(
                    Regex("\\{(.*?)\\}"),
                    "(?:$1}?")
            )
        }

        // [(parameter)=(value)](.*)
        parameterRegex.matchEntire(toParse)?.run {
            require(groupValues.size == 3)
            val (parameter, value, rest) = destructured
            parameters[parameter] = value
            return parse(rest)
        }

        // [(slot)](.*)
        untypedSlotRegex.matchEntire(toParse)?.run {
            require(groupValues.size == 2)
            val (slotName, rest) = destructured
            slots.add(slotName)
            regexBuilder.append("( .+?)")
            return parse(rest)
        }

        // [(slot):(slotType)](.*)
        typedSlotRegex.matchEntire(toParse)?.let {
            require(it.groupValues.size == 3)
            val (slotName, entityName, rest) = it.destructured
            slots.add(slotName)
            if (!entityTypes.containsKey(entityName)) {
                throw Error("No entity type by the name $entityName")
            }
            entityTypes[entityName]?.run {
                    joinTo(regexBuilder,
                        prefix = "(", separator = "|", postfix = ")"
                    )
            }
            return parse(rest)
        }

        // (alt1 |alt2 |..|altN| )
        alternativesRegex.matchEntire(toParse)?.run {
            require(groupValues.size == 2)
            val (alts, rest) = destructured
                alts.split("|")
                    .map { it.trim() }
                    .joinTo(regexBuilder, prefix = "(?:", separator = "|", postfix = ")") {
                        if (it.isEmpty()) "" else " $it"
                    }
            return parse(rest)
        }

        // everything before a left parenthesis or left bracket
        wordsRegex.matchEntire(toParse)?.run {
            require(groupValues.size == 2)
            val (words, rest) = destructured
            regexBuilder.append(" ${words.trim()}")
            return parse(rest)
        }

        throw Error("Malformed part (/$toParse/) or phrase (/$phrase/)")
    }

    private val entityTypes: Map<String, List<String>> = mapOf(
        "serviceName" to listOf("foo"),
        "musicServiceName" to listOf("bar"),
        "lang" to listOf("languages"),
        "smallNumber" to listOf(
            "1", "2", "3", "4", "5", "6", "7", "8", "9",
            "one", "two", "three", "four", "five", "six",
            "seven", "eight", "nine"
        )
    )
}
