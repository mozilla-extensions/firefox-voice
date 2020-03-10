package mozilla.voice.assistant.language

// This is used in place of mapOrDefault(), which isn't available until API 24 (Android 7).
private fun <K, V> Map<K, V>.getSafe(key: K, value: V): V = this[key] ?: value

private fun Map<String, List<Word>>.merge(map: Map<String, List<Word>>?): Map<String, List<Word>> =
    map?.let {
        (keys + map.keys).associateWith {
            getSafe(it, emptyList()) + map.getSafe(it, emptyList())
        }
    } ?: this

/**
 * A representation of the state of a match between a [Pattern] and an utterance.
 */
class MatchResult(
    internal val utterance: List<Word>,
    internal val index: Int = 0,
    internal val slots: Map<String, List<Word>> = emptyMap(),
    internal val parameters: Map<String, String> = emptyMap(),
    internal val capturedWords: Int = 0,
    internal val skippedWords: Int = 0,
    internal val aliasedWords: Int = 0,
    internal val intentName: String? = null
) {
    internal constructor(string: String, language: Language) : this(utterance = string.toWordList(language))

    override fun toString(): String {
        val s = buildString {
            for (i in utterance.indices) {
                if (i == index) {
                    append("^^")
                } else if (isNotEmpty()) {
                    append(' ')
                }
                append(utterance[i].toSource())
            }

            if (index >= utterance.size) {
                append("^^")
            }
        }
        val slotString = if (slots.isEmpty()) {
            ""
        } else {
            slots.keys.joinToString(
                prefix = ", slots: {",
                separator = ", ",
                postfix = "}"
            ) { name ->
                slots[name]?.let {
                    it.joinToString(
                        prefix = "$name: \"",
                        postfix = "\"",
                        separator = " "
                    ) { word -> word.toSource() }
                } ?: throw Error("Slot name $name not associated with any values")
            }
        }

        val paramString = if (parameters.isEmpty()) "" else ", parameters: $parameters"
        val skipString = if (skippedWords == 0) "" else ", skippedWords: $skippedWords"
        val aliasString = if (aliasedWords == 0) "" else ", aliasedWords: $aliasedWords"
        val intentString = intentName?.let { ", intentName: $it" } ?: ""

        return "MatchResult(\"$s\"$slotString$paramString$skipString$aliasString$intentString, capturedWords: $capturedWords)"
    }

    internal fun utteranceExhausted() = index >= utterance.size

    internal fun utteranceWord(): Word =
        if (utteranceExhausted()) {
            throw Error("Attempted to get utterance word past end: $this")
        } else {
            utterance[index]
        }

    internal fun slotString(slotName: String) =
        slots[slotName] ?.let {
            it.joinToString(separator = " ") { word ->
                word.toSource()
            }
        }

    internal fun stringSlots(): Map<String, String> = slots.mapValues {
        it.value.joinToString(separator = " ") { w ->
            w.toSource()
        }
    }

    // This method should not be confused with Object.clone().
    internal fun clone(
        addIndex: Int = 0,
        slots: Map<String, List<Word>>? = null,
        parameters: Map<String, String>? = null,
        addWords: Int = 0,
        addSkipped: Int = 0,
        addAliased: Int = 0,
        intentName: String? = null
    ) =
        MatchResult(
            utterance = this.utterance,

            index =
            if (this.index + addIndex > this.utterance.size) {
                throw Error("Attempted to move past the end of the end")
            } else {
                this.index + addIndex
            },

            slots = this.slots.merge(slots),

            parameters = parameters?.let {
                it.keys.forEach { key ->
                    if (this.parameters.containsKey(key)) {
                        throw Error("Attempted to override parameter $key (${parameters[key]}")
                    }
                }
                it + this.parameters
            } ?: this.parameters,

            intentName = intentName?.let { newIntent ->
                this.intentName?.let { oldIntent ->
                    throw Error("Attempted to override intentName ($oldIntent) with $newIntent")
                } ?: newIntent
            } ?: this.intentName,

            capturedWords = this.capturedWords + addWords,

            skippedWords = this.skippedWords + addSkipped,

            aliasedWords = this.aliasedWords + addAliased
        )
}
