package mozilla.voice.assistant

import androidx.annotation.VisibleForTesting

class Matcher(
    private val phrase: String,
    private val slots: List<String>, // names of slots
    private val slotTypes: Map<String, String>,
    private val parameters: Map<String, String>,
    @VisibleForTesting
    internal val regexString: String
) {
    private val regex = Regex("^$regexString$", RegexOption.IGNORE_CASE)
}
