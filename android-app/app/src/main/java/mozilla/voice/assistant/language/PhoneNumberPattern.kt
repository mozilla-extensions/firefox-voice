package mozilla.voice.assistant.language

/**
 * A [Pattern] that matches strings representing phone numbers, as transcribed by
 * [android.speech.SpeechRecognizer]. For now, it recognizes phone numbers for the United States
 * and Canada only, with or without area codes (e.g, "415-555-1212" and "555-2345").
 */
class PhoneNumberPattern : Pattern {
    override fun matchUtterance(match: MatchResult): List<MatchResult> =
        if (match.utteranceExhausted() || !PHONE_NUM_REGEX.matches(match.utteranceWord().toSource())) {
            emptyList()
        } else {
            listOf(
                match.clone(
                    addIndex = 1,
                    addWords = 1
                )
            )
        }

    override fun toSource(): String = "<phone-number>"

    override fun slotNames(): Set<String> = emptySet()

    companion object {
        private val PHONE_NUM_REGEX = Regex("""((\d\d\d-)?\d\d\d-\d\d\d\d)""")
    }
}
