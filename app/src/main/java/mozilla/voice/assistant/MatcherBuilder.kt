package mozilla.voice.assistant

import androidx.annotation.VisibleForTesting

class MatcherBuilder(
    private val phrase: String
) {
    @VisibleForTesting
    internal val slots = mutableListOf<String>()
    @VisibleForTesting
    internal val slotTypes = mutableMapOf<String, String>()
    @VisibleForTesting
    internal val parameters = mutableMapOf<String, String>()
    @VisibleForTesting
    internal val regexBuilder = StringBuilder()

    fun build(): Matcher? {
        if (phrase.isEmpty()) {
            return null
        }
        return parse(phrase)
    }

    private fun parse(toParse0: String): Matcher {
        val toParse = toParse0.trim()
        if (toParse.isEmpty()) {
            return Matcher(
                phrase,
                slots,
                slotTypes,
                parameters,
                regexBuilder.replace(
                    Regex("\\{(.*?)\\}"),
                    "(?:$1)?"
                )
            )
        }

        // [(parameter)=(value)](.*)
        parameterRegex.matchEntire(toParse)?.run {
            require(groupValues.size == 4)
            val (parameter, value, rest) = destructured
            parameters[parameter] = value
            return parse(rest)
        }

        // [(slot)](.*)
        untypedSlotRegex.matchEntire(toParse)?.run {
            require(groupValues.size == 3)
            val (slotName, rest) = destructured
            slots.add(slotName)
            regexBuilder.append("( .+?)")
            return parse(rest)
        }

        // [(slot):(slotType)](.*)
        typedSlotRegex.matchEntire(toParse)?.let {
            require(it.groupValues.size == 4)
            val (slotName, entityName, rest) = it.destructured
            slots.add(slotName)
            if (!entityTypes.containsKey(entityName)) {
                throw Error("No entity type by the name $entityName")
            }
            slotTypes[slotName] = entityName
            entityTypes[entityName]?.run {
                joinTo(
                    regexBuilder,
                    prefix = "(", separator = "|", postfix = ")"
                ) {
                    if (it.isEmpty()) "" else " $it"
                }
            }
            return parse(rest)
        }

        // (alt1 |alt2 |..|altN| )
        alternativesRegex.matchEntire(toParse)?.run {
            require(groupValues.size == 3)
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
            require(groupValues.size == 3)
            val (words, rest) = destructured
            regexBuilder.append(" ${words.trim()}")
            return parse(rest)
        }

        throw Error("Malformed part (/$toParse/) or phrase (/$phrase/)")
    }

    companion object {
        @VisibleForTesting
        val parameterRegex = Regex("\\[\\s*(\\w+)\\s*=\\s*(\\w+)\\s*](.*)")
        @VisibleForTesting
        internal val untypedSlotRegex = Regex("\\[\\s*(\\w+)\\s*\\](.*)")
        @VisibleForTesting
        internal val typedSlotRegex = Regex("\\[\\s*(\\w+)\\s*:\\s*(\\w+)\\s*\\](.*)")
        @VisibleForTesting
        internal val alternativesRegex = Regex("\\s*\\(([^)]+)\\)(.*)")
        @VisibleForTesting
        internal val wordsRegex = Regex("\\s*([^\\(\\[]+)(.*)")

        // TODO: Build dynamically
        private val entityTypes: Map<String, List<String>> = mapOf(
            "serviceName" to listOf("foo"),
            "musicServiceName" to listOf("youtube", "spotify", "video"),
            "lang" to listOf("English", "Spanish", "French"),
            "smallNumber" to listOf(
                "1", "2", "3", "4", "5", "6", "7", "8", "9",
                "one", "two", "three", "four", "five", "six",
                "seven", "eight", "nine"
            )
        )
    }
}
