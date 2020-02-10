package mozilla.voice.assistant

import org.junit.Assert.assertEquals
import org.junit.Assert.fail
import org.junit.BeforeClass
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class IntentRunnerTest {
    @Test
    fun testDuplicateRegistrationFails() {
        try {
            IntentRunner.registerIntent(sandwichIntent)
            fail("Re-registering an intent should have failed")
        } catch (err: Error) {}
    }

    @Test
    fun testSandwichIntent() {
        sandwichType = null
        IntentRunner.runUtterance("make a ham sandwich")
        assertEquals("ham", sandwichType)
    }

    companion object {
        private var sandwichType: String? = null
        private val sandwichIntent = Intent(
            "sandwich",
            "make a sandwich",
            listOf("make a cheese sandwich", "make a jam sandwich"),
            listOf("make a [type] sandwich", "make me a [type] sandwich")
        ) { mr -> sandwichType = mr.slots["type"] }

        @BeforeClass
        @JvmStatic
        fun setup() {
            IntentRunner.registerIntent(sandwichIntent)
        }
    }
}
