package mozilla.voice.assistant.intents.communication.ui.contact

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class ContactViewModelTest {
    @Test
    fun testToPossibleNicknames() {
        listOf(
            Pair(listOf("a b c", "a b", "a"), "a b c d e f"),
            Pair(listOf("a b c", "a b", "a"), "a b c def"),
            Pair(listOf("a b", "a"), "a b"),
            Pair(listOf("a"), "a")
        ).forEach {
            assertEquals(it.first, it.second.split(" ").toPossibleNicknames())
        }}
}
