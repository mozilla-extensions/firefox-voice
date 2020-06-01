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
        }
    }

    @Test
    fun testPayloadToMessage() {
        listOf(
            Pair("gate bridge", "Jessica Golden"),
            Pair("gate bridge", "Jessica Golden, PhD"),
            Pair("golden gate bridge", "jessica rabbit"),
            Pair("jessica golden gate bridge", "Aaron")
        ).forEach {
            assertEquals(
                it.first,
                ContactViewModel.extractMessage("jessica golden gate bridge", it.second)
            )
        }
    }
}
