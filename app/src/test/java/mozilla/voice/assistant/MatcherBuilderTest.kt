package mozilla.voice.assistant

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.runners.JUnit4

@RunWith(JUnit4::class)
class MatcherBuilderTest {
    private fun testRegex(regex: Regex, phrase: String, vararg expected: String) {
        regex.matchEntire(phrase)?.run {
            assertEquals(expected.size + 1, groups.size)
            for (i in expected.indices) {
                assertEquals(expected[i], groupValues[i + 1])
            }
            return
        }
        throw AssertionError("Regex /$regex/ did not match: $phrase")
    }

    @Test
    fun testParameterRegexMatches() {
        listOf(
            listOf("[x=5]", "x", "5", ""),
            listOf("[ x =  5 ]", "x", "5", ""),
            listOf("[foo=bar]baz", "foo", "bar", "baz"),
            listOf("[foo=bar][baz=3]", "foo", "bar", "[baz=3]")
        ).forEach {
            testRegex(MatcherBuilder.parameterRegex, it[0], it[1], it[2], it[3])
        }
    }

    @Test
    fun testParameterRegexMisses() {
        listOf("", "x=5", "[foo=bar").forEach {
            assertNull(
                "Did not expect parameterRegex to match: $it",
                MatcherBuilder.parameterRegex.matchEntire(it)
            )
        }
    }

    @Test
    fun testUntypedSlotRegexMatches() {
        listOf(
            listOf("[x]", "x", ""),
            listOf("[foo]bar", "foo", "bar"),
            listOf("[foo][bar]", "foo", "[bar]")
        ).forEach {
            testRegex(MatcherBuilder.untypedSlotRegex, it[0], it[1], it[2])
        }
    }

    @Test
    fun testUntypedSlotRegexMisses() {
        listOf("", "x=5", "[foo=bar", "[foo=bar]").forEach {
            assertNull(
                "Did not expect untypedSlotRegex to match: $it",
                MatcherBuilder.untypedSlotRegex.matchEntire(it)
            )
        }
    }

    @Test
    fun testTypedSlotRegexMatches() {
        listOf(
            listOf("[x:serviceName]more", "x", "serviceName", "more"),
            listOf("[mu:musicServiceName][more]", "mu", "musicServiceName", "[more]"),
            listOf("[language:lang]", "language", "lang", ""),
            listOf("[s:smallNumber][more:lang]", "s", "smallNumber", "[more:lang]")
        ).forEach {
            testRegex(MatcherBuilder.typedSlotRegex, it[0], it[1], it[2], it[3])
        }
    }

    @Test
    fun testTypedSlotRegexMisses() {
        listOf("", "x=5", "[foo=bar", "[foo=bar]").forEach {
            assertNull(
                "Did not expect typedSlotRegex to match: $it",
                MatcherBuilder.typedSlotRegex.matchEntire(it)
            )
        }
    }

    @Test
    fun testAlternativesRegexMatches() {
        listOf(
            listOf("(foo|bar|baz)not this part", "foo|bar|baz", "not this part"),
            listOf("(12 57 91))", "12 57 91", ")")
        ).forEach {
            testRegex(MatcherBuilder.alternativesRegex, it[0], it[1], it[2])
        }
    }

    @Test
    fun testAlternativesRegexMisses() {
        listOf("", "x=5", "[foo=bar", "[foo=bar]", "(foo", "(foo(31").forEach {
            assertNull(
                "Did not expect alternativesRegex to match: $it",
                MatcherBuilder.alternativesRegex.matchEntire(it)
            )
        }
    }

    @Test
    fun testWordsRegexMatches() {
        listOf(
            listOf("hello(foo)", "hello", "(foo)"),
            listOf("1 | 2 | 3 [now]", "1 | 2 | 3 ", "[now]")
        ).forEach {
            testRegex(MatcherBuilder.wordsRegex, it[0], it[1], it[2])
        }
    }

    @Test
    fun testWordsRegexMisses() {
        listOf("", "(hi", "((hi))", "[", "(").forEach {
            assertNull(
                "Did not expect wordsRegex to match: $it",
                MatcherBuilder.wordsRegex.matchEntire(it)
            )
        }
    }

    private fun testParseHelper(
        phrase: String,
        regex: String,
        slots: List<String> = emptyList(),
        slotTypes: Map<String, String> = emptyMap(),
        parameters: Map<String, String> = emptyMap()
    ) {
        val mb = MatcherBuilder(phrase)
        val matcher = mb.build()
        assertNotNull(matcher)
        assertEquals("Slots differ when parsing /$phrase/", slots, mb.slots)
        assertEquals("Slot types differ when parsing /$phrase/", slotTypes, mb.slotTypes)
        assertEquals("Parameters differ when parsing /$phrase/", parameters, mb.parameters)
        assertEquals("Final regex differs when parsing /$phrase/", regex, matcher?.regexString)
    }

    @Test
    fun testParse() {
        // Made-up examples
        assertNotNull(Regex("\\{(.*?)\\}").find("child{ren}"))
        testParseHelper("oranges and lemons", " oranges and lemons")
        testParseHelper("(oranges | lemons)", "(?: oranges| lemons)")
        testParseHelper("(oranges | lemons|  )", "(?: oranges| lemons|)")

        testParseHelper(
            "child{ren} and adults",
            " child(?:ren)? and adults"
        )

        testParseHelper(
            "foo ",
            " foo"
        )

        testParseHelper(
            "(for me |) ",
            // fails with extra space at end
            "(?: for me|)"
        )
    }

    @Test
    fun testParseAboutPage() { // aboutPage.js
        testParseHelper(
            "next comment{s} [move=next]",
            " next comment(?:s)?",
            parameters = mapOf(
                "move" to "next"
            )
        )
        testParseHelper(
            "previous comment{s} [move=previous]",
            " previous comment(?:s)?",
            parameters = mapOf(
                "move" to "previous"
            )
        )

        testParseHelper(
            "(show | open |) comment{s} on (this |) (page | tab | article) (to me | for me |)",
            "(?: show| open|) comment(?:s)? on(?: this|)(?: page| tab| article)(?: to me| for me|)"
        )

        testParseHelper(
            "(show | open |) what are people (saying | talking | commenting) about (this |) (page | tab | article) (to me | for me |)",
            "(?: show| open|) what are people(?: saying| talking| commenting) about(?: this|)(?: page| tab| article)(?: to me| for me|)"
        )

        testParseHelper(
            "(show | open |) what are people (saying | talking | commenting) about (this |) (page | tab | article) (to me | for me |)",
            "(?: show| open|) what are people(?: saying| talking| commenting) about(?: this|)(?: page| tab| article)(?: to me| for me|)"
        )
        testParseHelper(
            "(show | open |) comments (for | on) (this |) (page | tab | article) (to me | for me |)",
            "(?: show| open|) comments(?: for| on)(?: this|)(?: page| tab| article)(?: to me| for me|)"
        )
        testParseHelper(
            "(show | open |) comments (to me | for me |)",
            "(?: show| open|) comments(?: to me| for me|)"
        )
    }

    @Test
    fun testParseBookmarks() {
        testParseHelper(
            "open [query] bookmark (for me |) in (this | current |) tab (for me |) ",
            // fails with extra space at end
            " open( .+?) bookmark(?: for me|) in(?: this| current|) tab(?: for me|)",
            slots = listOf("query")
        )

        testParseHelper(
            "open [query] bookmark (for me |) in (this | current |) tab (for me |) [tab=this]",
            " open( .+?) bookmark(?: for me|) in(?: this| current|) tab(?: for me|)",
            slots = listOf("query"),
            parameters = mapOf(
                "tab" to "this"
            )
        )
        testParseHelper(
            "open bookmark [query] (for me |) in (this | current |) tab (for me |) [tab=this]",
            " open bookmark( .+?)(?: for me|) in(?: this| current|) tab(?: for me|)",
            slots = listOf("query"),
            parameters = mapOf(
                "tab" to "this"
            )
        )
        testParseHelper(
            "open [query] bookmark in new (tab |)",
            " open( .+?) bookmark in new(?: tab|)",
            slots = listOf("query")
        )
        testParseHelper(
            "open bookmark [query] in new (tab |)",
            " open bookmark( .+?) in new(?: tab|)",
            slots = listOf("query")
        )
        testParseHelper(
            "open [query] bookmark (for me|)",
            " open( .+?) bookmark(?: for me|)",
            slots = listOf("query")
        )
        testParseHelper(
            "open bookmark [query] (for me|)",
            " open bookmark( .+?)(?: for me|)",
            slots = listOf("query")
        )
    }

    @Test
    fun testParseClipboard() {
        testParseHelper(
            "copy (the |) full (page |) (screenshot |) of (the | this |) tab (to clipboard |)",
            " copy(?: the|) full(?: page|)(?: screenshot|) of(?: the| this|) tab(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) (tab's |) full (page |) (screenshot |) (to clipboard |)",
            " copy(?: the|)(?: tab's|) full(?: page|)(?: screenshot|)(?: to clipboard|)"
        )
        testParseHelper(
            "screenshot full (page |) to clipboard",
            " screenshot full(?: page|) to clipboard"
        )
        testParseHelper(
            "copy (the |) (this |) (tab's |) (link | url) (of this tab |) (to clipboard |)",
            " copy(?: the|)(?: this|)(?: tab's|)(?: link| url)(?: of this tab|)(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) markdown link of (the | this |) tab (to clipboard |)",
            " copy(?: the|) markdown link of(?: the| this|) tab(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) markdown (tab |) link (to clipboard |)",
            " copy(?: the|) markdown(?: tab|) link(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) markdown title and link (to clipboard |)",
            " copy(?: the|) markdown title and link(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) markdown link and title (to clipboard |)",
            " copy(?: the|) markdown link and title(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) (rich | html) link of (the | this |) tab (to clipboard |)",
            " copy(?: the|)(?: rich| html) link of(?: the| this|) tab(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) (rich | html) (tab |) link (to clipboard |)",
            " copy(?: the|)(?: rich| html)(?: tab|) link(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) (rich | html) link (to clipboard |)",
            " copy(?: the|)(?: rich| html) link(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) title and link (to clipboard |)",
            " copy(?: the|) title and link(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) link and title (to clipboard |)",
            " copy(?: the|) link and title(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) screenshot of (the | this |) tab (to clipboard |)",
            " copy(?: the|) screenshot of(?: the| this|) tab(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) (tab's |) screenshot (to clipboard |)",
            " copy(?: the|)(?: tab's|) screenshot(?: to clipboard|)"
        )
        testParseHelper(
            "screenshot (this |) (tab |) to clipboard",
            " screenshot(?: this|)(?: tab|) to clipboard"
        )
        testParseHelper(
            "copy (this |) (selection |) (to clipboard |)",
            " copy(?: this|)(?: selection|)(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) title of (the | this |) tab (to clipboard |)",
            " copy(?: the|) title of(?: the| this|) tab(?: to clipboard|)"
        )
        testParseHelper(
            "copy (the |) tab title (to clipboard |)",
            " copy(?: the|) tab title(?: to clipboard|)"
        )
        testParseHelper(
            "copy title (to clipboard |)",
            " copy title(?: to clipboard|)"
        )
        testParseHelper(
            "paste (the |) (selection | clipboard |)",
            " paste(?: the|)(?: selection| clipboard|)"
        )
    }

    @Test
    fun testParseFind() {
        testParseHelper(
            "(find | bring me to | switch to) (my | the |) [query] (tab |)",
            "(?: find| bring me to| switch to)(?: my| the|)( .+?)(?: tab|)",
            slots = listOf("query")
        )
        testParseHelper(
            "(find | open | focus | show | switch to) tab [query]",
            "(?: find| open| focus| show| switch to) tab( .+?)",
            slots = listOf("query")
        )
        testParseHelper(
            "go (to | to the |) [query] tab",
            " go(?: to| to the|)( .+?) tab",
            slots = listOf("query")
        )
        testParseHelper(
            "go to my [query]",
            " go to my( .+?)",
            slots = listOf("query")
        )
        testParseHelper(
            "focus [query] (tab |)",
            " focus( .+?)(?: tab|)",
            slots = listOf("query")
        )
    }

    @Test
    fun testParseMusic() {
        testParseHelper(
            "(open | show | focus) (my | the |) video (for me |) [service=youtube]",
            "(?: open| show| focus)(?: my| the|) video(?: for me|)",
            parameters = mapOf("service" to "youtube")
        )

        testParseHelper(
            "(open | show | focus) [service:musicServiceName] (for me|)",
            "(?: open| show| focus)( youtube| spotify| video)(?: for me|)",
            slots = listOf("service"),
            slotTypes = mapOf("service" to "musicServiceName")
        )

        testParseHelper(
            "(open | show | focus) music",
            "(?: open| show| focus) music"
        )

        testParseHelper(
            "(play |) next video               [direction=next] [service=youtube]",
            "(?: play|) next video",
            parameters = mapOf("direction" to "next", "service" to "youtube")
        )

        testParseHelper(
            "skip video                        [direction=next] [service=youtube]",
            " skip video",
            parameters = mapOf("direction" to "next", "service" to "youtube")
        )

        testParseHelper(
            "(play |) previous video           [direction=back] [service=youtube]",
            "(?: play|) previous video",
            parameters = mapOf("direction" to "back", "service" to "youtube")
        )

        testParseHelper(
            "play next (song | track |)        [direction=next]",
            " play next(?: song| track|)",
            parameters = mapOf("direction" to "next")
        )

        testParseHelper(
            "next (song | track)             [direction=next]",
            " next(?: song| track)",
            parameters = mapOf("direction" to "next")
        )

        testParseHelper(
            "play previous (song | track |)    [direction=back]",
            " play previous(?: song| track|)",
            parameters = mapOf("direction" to "back")
        )

        testParseHelper(
            "previous (song | track)         [direction=back]",
            " previous(?: song| track)",
            parameters = mapOf("direction" to "back")
        )

        testParseHelper(
            "(skip | forward) (song | track |) [direction=next]",
            "(?: skip| forward)(?: song| track|)",
            parameters = mapOf("direction" to "next")
        )

        testParseHelper(
            "(stop | pause) video [service=youtube]",
            "(?: stop| pause) video",
            parameters = mapOf("service" to "youtube")
        )

        testParseHelper(
            "pause [service:musicServiceName]",
            " pause( youtube| spotify| video)",
            slots = listOf("service"),
            slotTypes = mapOf("service" to "musicServiceName")
        )

        testParseHelper(
            "pause (music |)",
            " pause(?: music|)"
        )

        testParseHelper(
            "stop (music |)",
            " stop(?: music|)"
        )

        testParseHelper(
            "play [query] (on | in) [service:musicServiceName]",
            " play( .+?)(?: on| in)( youtube| spotify| video)",
            slots = listOf("query", "service"),
            slotTypes = mapOf("service" to "musicServiceName")
        )

        testParseHelper(
            "play video{s} [query] [service=youtube]",
            " play video(?:s)?( .+?)",
            slots = listOf("query"),
            parameters = mapOf("service" to "youtube")
        )

        testParseHelper(
            "play [query] video{s} [service=youtube]",
            " play( .+?) video(?:s)?",
            slots = listOf("query"),
            parameters = mapOf("service" to "youtube")
        )

        testParseHelper(
            "play [query]",
            " play( .+?)",
            slots = listOf("query")
        )

        testParseHelper(
            "(do a |) (search | query | look up| look | look up | lookup) (on | in |) (my |) [service:musicServiceName] (for | for the |) [query]",
            "(?: do a|)(?: search| query| look up| look| look up| lookup)(?: on| in|)(?: my|)( youtube| spotify| video)(?: for| for the|)( .+?)",
            slots = listOf("service", "query"),
            slotTypes = mapOf("service" to "musicServiceName")
        )

        testParseHelper(
            "(do a |) (search | query ) my [service:musicServiceName] (for | for the |) [query]",
            "(?: do a|)(?: search| query) my( youtube| spotify| video)(?: for| for the|)( .+?)",
            slots = listOf("service", "query"),
            slotTypes = mapOf("service" to "musicServiceName")
        )

        testParseHelper(
            "(do a |) (search | query ) (on |) [service:musicServiceName] (for | for the) [query]",
            "(?: do a|)(?: search| query)(?: on|)( youtube| spotify| video)(?: for| for the)( .+?)",
            slots = listOf("service", "query"),
            slotTypes = mapOf("service" to "musicServiceName")
        )

        testParseHelper(
            "(do a |) (search | query | find | find me | look up | lookup | look on | look for) (my | on | for | in |) (the |) [query] (on | in) [service:musicServiceName]",
            "(?: do a|)(?: search| query| find| find me| look up| lookup| look on| look for)(?: my| on| for| in|)(?: the|)( .+?)(?: on| in)( youtube| spotify| video)",
            slots = listOf("query", "service"),
            slotTypes = mapOf("service" to "musicServiceName")
        )

        testParseHelper(
            "(unpause | continue | play) video [service=youtube]",
            "(?: unpause| continue| play) video",
            parameters = mapOf("service" to "youtube")
        )

        testParseHelper(
            "(unpause | continue | play) [service:musicServiceName]",
            "(?: unpause| continue| play)( youtube| spotify| video)",
            slots = listOf("service"),
            slotTypes = mapOf("service" to "musicServiceName")
        )

        testParseHelper(
            "(unpause | continue | play) (music |)",
            "(?: unpause| continue| play)(?: music|)"
        )

        testParseHelper(
            "(mute | turn off) (whatever is |) (playing | all |) (the |) (music | audio | sound | everything | tab{s}) (for me |)",
            "(?: mute| turn off)(?: whatever is|)(?: playing| all|)(?: the|)(?: music| audio| sound| everything| tab(?:s)?)(?: for me|)"
        )
    }
}
