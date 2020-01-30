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
