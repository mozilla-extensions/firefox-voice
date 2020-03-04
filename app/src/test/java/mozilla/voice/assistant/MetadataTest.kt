package mozilla.voice.assistant

import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class MetadataTest {
    @Before
    fun parseToml() {
        Metadata.initializeForTest(FILE_NAME, TEST_INPUT)
    }

    @Test
    fun testGetDescription() {
        assertEquals("Find the open tab", Metadata.getDescription(INTENT_NAME))
    }

    companion object {
        private const val FILE_NAME = "find"
        private const val INTENT_NAME = "find.find" // must start with FILE_NAME

        private val TEST_INPUT = """
            [find.find]
            description = "Find the open tab"
            match = !!!
              (find | bring me to | bring up | switch to) (my | the |) [query] (tab |)
              (find | open | focus | show | switch to) tab [query]
              go (to | to the |) [query] tab
              go to my [query]
              focus [query] (tab |)
            !!!

            [[find.find.example]]
            phrase = "Find calendar tab"

            [[find.find.example]]
            phrase = "go to my calendar"
            test = true

            [[find.find.example]]
            phrase = "bring up my calendar"
            test = true
        """.trimIndent().replace('!', '"')
    }
}