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
    // Made-up examples
    fun testParse() {
        testParseHelper("oranges and lemons", " oranges and lemons")
        testParseHelper("(oranges | lemons)", "(?: oranges| lemons)")
        testParseHelper("(oranges | lemons|  )", "(?: oranges| lemons|)")
        testParseHelper("child{ren} and adults", " child(?:ren)? and adults")
        testParseHelper("foo ", " foo")
        testParseHelper("(for me |) ", "(?: for me|)")
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
    fun testParseBookmarks() { // bookmarks.js
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
    fun testParseClipboard() { // clipboard.js
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
    fun testParseFind() { // find.js
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
    fun testParseMusic() { // music.js
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

    @Test
    fun testParseMuting() { // muting.js
        testParseHelper(
            "(mute | turn off) (whatever is |) (playing | all |) (the |) (music | audio | sound | everything | tab{s}) (for me |)",
            "(?: mute| turn off)(?: whatever is|)(?: playing| all|)(?: the|)(?: music| audio| sound| everything| tab(?:s)?)(?: for me|)"
        )
        testParseHelper(
            "mute",
            " mute"
        )
        testParseHelper(
            "quiet (tabs{s} |) (for me |)",
            " quiet(?: tabs(?:s)?|)(?: for me|)"
        )
        testParseHelper(
            "shut up (tab{s} |) (for me |)",
            " shut up(?: tab(?:s)?|)(?: for me|)"
        )
        testParseHelper(
            "unmute (tab{s} |) (for me |)",
            " unmute(?: tab(?:s)?|)(?: for me|)"
        )
    }

    @Test
    fun testParseNavigation() { // navigation.js
        testParseHelper(
            "google images (of | for |) [query] [service=images]",
            " google images(?: of| for|)( .+?)",
            slots = listOf("query"),
            parameters = mapOf("service" to "images")
        )
        testParseHelper(
            "images (of | for) [query] [service=images]",
            " images(?: of| for)( .+?)",
            slots = listOf("query"),
            parameters = mapOf("service" to "images")
        )
        testParseHelper(
            "(do a |) (search | search on | query on | lookup on | look up on | look on | look in | look up in | lookup in) (my |) [service:serviceName] (for | for the |) [query] (for me |)",
            "(?: do a|)(?: search| search on| query on| lookup on| look up on| look on| look in| look up in| lookup in)(?: my|)( google slides| slides| google docs| google scholar| calendar| google calendar| google drive| google sheets| sheets| spreadsheets| goodreads| mdn| coursera| gmail| mail| email| google mail| amazon| wikipedia| wiki| yelp| twitter| reddit| amazon music| google music| google play music| pandora| soundcloud| sound cloud| tunein| tune in| tunein radio| tune in radio| vimeo| netflix| apple maps| google maps| maps| open street maps| open maps| stubhub| stub hub| ticketmaster| ticket master| google translate| translate| instagram| insta| linkedin| quora| pinterest| pin| facebook| stackexchange| stack exchange| dropbox| dictionary.com| dictionary| thesaurus| duckduckgo| duck duck go| duckduckgo images| duck duck go images| google images| images)(?: for| for the|)( .+?)(?: for me|)",
            slots = listOf("service", "query"),
            slotTypes = mapOf("service" to "serviceName")
        )
        testParseHelper(
            "(do a |) (search | query ) my [service:serviceName] (for | for the |) [query] (for me|)",
            "(?: do a|)(?: search| query) my( google slides| slides| google docs| google scholar| calendar| google calendar| google drive| google sheets| sheets| spreadsheets| goodreads| mdn| coursera| gmail| mail| email| google mail| amazon| wikipedia| wiki| yelp| twitter| reddit| amazon music| google music| google play music| pandora| soundcloud| sound cloud| tunein| tune in| tunein radio| tune in radio| vimeo| netflix| apple maps| google maps| maps| open street maps| open maps| stubhub| stub hub| ticketmaster| ticket master| google translate| translate| instagram| insta| linkedin| quora| pinterest| pin| facebook| stackexchange| stack exchange| dropbox| dictionary.com| dictionary| thesaurus| duckduckgo| duck duck go| duckduckgo images| duck duck go images| google images| images)(?: for| for the|)( .+?)(?: for me|)",
            slots = listOf("service", "query"),
            slotTypes = mapOf("service" to "serviceName")
        )
        testParseHelper(
            "(do a |) (search | query | find | find me | look up | lookup | look on | look for) (my | on | for | in |) (the |) [query] (on | in) [service:serviceName] (for me |)",
            "(?: do a|)(?: search| query| find| find me| look up| lookup| look on| look for)(?: my| on| for| in|)(?: the|)( .+?)(?: on| in)( google slides| slides| google docs| google scholar| calendar| google calendar| google drive| google sheets| sheets| spreadsheets| goodreads| mdn| coursera| gmail| mail| email| google mail| amazon| wikipedia| wiki| yelp| twitter| reddit| amazon music| google music| google play music| pandora| soundcloud| sound cloud| tunein| tune in| tunein radio| tune in radio| vimeo| netflix| apple maps| google maps| maps| open street maps| open maps| stubhub| stub hub| ticketmaster| ticket master| google translate| translate| instagram| insta| linkedin| quora| pinterest| pin| facebook| stackexchange| stack exchange| dropbox| dictionary.com| dictionary| thesaurus| duckduckgo| duck duck go| duckduckgo images| duck duck go images| google images| images)(?: for me|)",
            slots = listOf("query", "service"),
            slotTypes = mapOf("service" to "serviceName")
        )
        testParseHelper(
            "clear query (database | cache)",
            " clear query(?: database| cache)"
        )
        testParseHelper(
            "(bring me | take me | go | navigate | show me | open) (to | find |) (page |) [query]",
            "(?: bring me| take me| go| navigate| show me| open)(?: to| find|)(?: page|)( .+?)",
            slots = listOf("query")
        )
        testParseHelper(
            "translate (this |) (page | tab | article | site |) (to english |) (for me |)",
            " translate(?: this|)(?: page| tab| article| site|)(?: to english|)(?: for me|)"
        )
        testParseHelper(
            "translate (this |) (page | tab | article | site |) to [language:lang] (for me |)",
            " translate(?: this|)(?: page| tab| article| site|) to( czech| danish| dutch| english| finnish| french| german| hungarian| italian| norwegian| polish| portuguese| romanian| russian| slovak| slovenian| spanish| swedish| turkish| ukrainian)(?: for me|)",
            slots = listOf("language"),
            slotTypes = mapOf("language" to "lang")
        )
        testParseHelper(
            "translate (this |) selection (to english |) (for me |)",
            " translate(?: this|) selection(?: to english|)(?: for me|)"
        )
        testParseHelper(
            "translate (this |) selection to [language:lang] (for me |)",
            " translate(?: this|) selection to( czech| danish| dutch| english| finnish| french| german| hungarian| italian| norwegian| polish| portuguese| romanian| russian| slovak| slovenian| spanish| swedish| turkish| ukrainian)(?: for me|)",
            slots = listOf("language"),
            slotTypes = mapOf("language" to "lang")
        )
    }

    @Test
    fun testParseNicknames() { // nicknames.js
        testParseHelper(
            "(name | nickname | call) (that | it | last) [name]",
            "(?: name| nickname| call)(?: that| it| last)( .+?)",
            slots = listOf("name")
        )
        testParseHelper(
            "give (that |) (the |) (name | nickname) [name]",
            " give(?: that|)(?: the|)(?: name| nickname)( .+?)",
            slots = listOf("name")
        )
        testParseHelper(
            "give (the |) (name | nickname) [name] to (that | it | last)",
            " give(?: the|)(?: name| nickname)( .+?) to(?: that| it| last)",
            slots = listOf("name")
        )
        testParseHelper(
            "(name | nickname | call) last [number:smallNumber] [name]",
            "(?: name| nickname| call) last( 1| 2| 3| 4| 5| 6| 7| 8| 9| one| two| three| four| five| six| seven| eight| nine)( .+?)",
            slots = listOf("number", "name"),
            slotTypes = mapOf("number" to "smallNumber")
        )
        testParseHelper(
            "give (the |) last [number:smallNumber] (the |) (name | nickname) [name]",
            " give(?: the|) last( 1| 2| 3| 4| 5| 6| 7| 8| 9| one| two| three| four| five| six| seven| eight| nine)(?: the|)(?: name| nickname)( .+?)",
            slots = listOf("number", "name"),
            slotTypes = mapOf("number" to "smallNumber")
        )
        testParseHelper(
            "give (the |) (name | nickname) [name] to (the |) last [number:smallNumber]",
            " give(?: the|)(?: name| nickname)( .+?) to(?: the|) last( 1| 2| 3| 4| 5| 6| 7| 8| 9| one| two| three| four| five| six| seven| eight| nine)",
            slots = listOf("name", "number"),
            slotTypes = mapOf("number" to "smallNumber")
        )
        testParseHelper(
            "(remove | delete) (the|) (name | nickname) (called |) [name]",
            "(?: remove| delete)(?: the|)(?: name| nickname)(?: called|)( .+?)",
            slots = listOf("name")
        )
    }

    @Test
    fun testParseNotes() { // notes.js
        testParseHelper(
            "(make | add | write) note{s} (about |) [text] (for me |)",
            "(?: make| add| write) note(?:s)?(?: about|)( .+?)(?: for me|)",
            slots = listOf("text")
        )
        testParseHelper(
            "(make | add | write |) note{s} (of | about |) (this |) (page | tab | link) (for me |)",
            "(?: make| add| write|) note(?:s)?(?: of| about|)(?: this|)(?: page| tab| link)(?: for me|)"
        )
        testParseHelper(
            "(add | make) note{s} (here | this page | this tab) (for me |)",
            "(?: add| make) note(?:s)?(?: here| this page| this tab)(?: for me|)"
        )
        testParseHelper(
            "write (note{s} |) (here | this page | this tab) (for me |)",
            " write(?: note(?:s)?|)(?: here| this page| this tab)(?: for me|)"
        )
        testParseHelper(
            "(show | focus | activate | read) (the |) note{s} (for me |)",
            "(?: show| focus| activate| read)(?: the|) note(?:s)?(?: for me|)"
        )
    }

    @Test
    fun testParsePrint() { // print.js
        testParseHelper(
            "print (this | the |) (current |) (tab | page |)",
            " print(?: this| the|)(?: current|)(?: tab| page|)"
        )
    }

    @Test
    fun testParseRead() { // read.js
        testParseHelper(
            "read (me | ) (this | ) (article | articles |) (tab | page |) (for me | to me |) (aloud |)",
            " read(?: me|)(?: this|)(?: article| articles|)(?: tab| page|)(?: for me| to me|)(?: aloud|)"
        )
        testParseHelper(
            "read (me |) [query] (for me | to me |) (aloud |)",
            " read(?: me|)( .+?)(?: for me| to me|)(?: aloud|)",
            slots = listOf("query")
        )
        testParseHelper(
            "stop reading (this |) (tab | page |) (to me | for me |)",
            " stop reading(?: this|)(?: tab| page|)(?: to me| for me|)"
        )
    }

    @Test
    fun testParseSaving() { // saving.js
        testParseHelper(
            "(save | download) (this | active |) (page | html) (as html |)",
            "(?: save| download)(?: this| active|)(?: page| html)(?: as html|)"
        )
        testParseHelper(
            "(save | download) (this | active |) (page | html) as [name]",
            "(?: save| download)(?: this| active|)(?: page| html) as( .+?)",
            slots = listOf("name")
        )
        testParseHelper(
            "(show | view | find | open) (download | file)",
            "(?: show| view| find| open)(?: download| file)"
        )
    }

    @Test
    fun testParseScroll() { // scroll.js
        testParseHelper(
            "scroll (this |) (tab | page | article |) all the way (down | downward |) (to the bottom |)",
            " scroll(?: this|)(?: tab| page| article|) all the way(?: down| downward|)(?: to the bottom|)"
        )
        testParseHelper(
            "scroll (this |) (tab | page | article |) (all the way |) to (the |) (very |) bottom",
            " scroll(?: this|)(?: tab| page| article|)(?: all the way|) to(?: the|)(?: very|) bottom"
        )
        testParseHelper(
            "page all the way (down | to the bottom | to bottom)",
            " page all the way(?: down| to the bottom| to bottom)"
        )
        testParseHelper(
            "scroll (this |) (tab | page | article |) (down | downward)",
            " scroll(?: this|)(?: tab| page| article|)(?: down| downward)"
        )
        testParseHelper(
            "page down",
            " page down"
        )
        testParseHelper(
            "scroll (this |) (tab | page | article |) all the way (up | upward) (to the top |)",
            " scroll(?: this|)(?: tab| page| article|) all the way(?: up| upward)(?: to the top|)"
        )
        testParseHelper(
            "scroll (this |) (tab | page | article |) (all the way |) to (the |) (very |) top",
            " scroll(?: this|)(?: tab| page| article|)(?: all the way|) to(?: the|)(?: very|) top"
        )
        testParseHelper(
            "page all the way (up | to the top | to top)",
            " page all the way(?: up| to the top| to top)"
        )
        testParseHelper(
            "scroll (this |) (tab | page | article |) (up | upward)",
            " scroll(?: this|)(?: tab| page| article|)(?: up| upward)"
        )
        testParseHelper(
            "page up",
            " page up"
        )
    }

    @Test
    fun testParseSearch() { // search.js
        testParseHelper(
            "(search |) next (to view |) (search |) (result{s} | item{s} | page | article |)",
            "(?: search|) next(?: to view|)(?: search|)(?: result(?:s)?| item(?:s)?| page| article|)"
        )
        testParseHelper(
            "(search |) previous (search |) (result{s} | item{s} | page | article |)",
            "(?: search|) previous(?: search|)(?: result(?:s)?| item(?:s)?| page| article|)"
        )
        testParseHelper(
            "(do a |) (query | find | find me | look up | lookup | look on | look for) (google | the web | the internet |) (for |) [query] (on the web |) (for me |)",
            "(?: do a|)(?: query| find| find me| look up| lookup| look on| look for)(?: google| the web| the internet|)(?: for|)( .+?)(?: on the web|)(?: for me|)",
            slots = listOf("query")
        )
        testParseHelper(
            "(do a |) (search | google) (google | the web | the internet |) (for |) [query] (one the web |) (for me|)",
            "(?: do a|)(?: search| google)(?: google| the web| the internet|)(?: for|)( .+?)(?: one the web|)(?: for me|)",
            slots = listOf("query")
        )
        testParseHelper(
            "(open | show | focus) search (result{s} |)",
            "(?: open| show| focus) search(?: result(?:s)?|)"
        )
        testParseHelper(
            "(open | show | focus) result{s}",
            "(?: open| show| focus) result(?:s)?"
        )
    }

    @Test
    fun testParseSelf() { // self.js
        testParseHelper(
            "cancel",
            " cancel"
        )
        testParseHelper(
            "nevermind",
            " nevermind"
        )
        testParseHelper(
            "never mind",
            " never mind"
        )
        testParseHelper(
            "(show | open) all intents (for me |)",
            "(?: show| open) all intents(?: for me|)"
        )
        testParseHelper(
            "(show | open) intent viewer (for me|)",
            "(?: show| open) intent viewer(?: for me|)"
        )
        testParseHelper(
            "tell me about (this | firefox voice | this extension | voice)",
            " tell me about(?: this| firefox voice| this extension| voice)"
        )
        testParseHelper(
            "help",
            " help"
        )
        testParseHelper(
            "what (else |) can (I | you) (do | say | ask) (you | from you | of you |)",
            " what(?: else|) can(?: I| you)(?: do| say| ask)(?: you| from you| of you|)"
        )
        testParseHelper(
            "hello",
            " hello"
        )
        testParseHelper(
            "(open | open the | voice | firefox voice) (settings | options) (for me |)",
            "(?: open| open the| voice| firefox voice)(?: settings| options)(?: for me|)"
        )
        testParseHelper(
            "tell (me |) a joke",
            " tell(?: me|) a joke"
        )
        testParseHelper(
            "say something funny",
            " say something funny"
        )
        testParseHelper(
            "make me laugh",
            " make me laugh"
        )
    }

    @Test
    fun testParseTabs() { // tabs.js
        testParseHelper(
            "close (this |) tab (for me |)",
            " close(?: this|) tab(?: for me|)"
        )
        testParseHelper(
            "duplicate (this | current |) (tab | page |) (for me |)",
            " duplicate(?: this| current|)(?: tab| page|)(?: for me|)"
        )
        testParseHelper(
            "(open | move) (tab | this) (in | to) (a |) new window (for me|)",
            "(?: open| move)(?: tab| this)(?: in| to)(?: a|) new window(?: for me|)"
        )
        testParseHelper(
            "open tab",
            " open tab"
        )
        testParseHelper(
            "(open | launch) (a | the |) (new | blank |) tab (for me|)",
            "(?: open| launch)(?: a| the|)(?: new| blank|) tab(?: for me|)"
        )
        testParseHelper(
            "new (blank |) tab",
            " new(?: blank|) tab"
        )
        testParseHelper(
            "(open | go to |) (my |) homepage (for me|)",
            "(?: open| go to|)(?: my|) homepage(?: for me|)"
        )
        testParseHelper(
            "open (a |) (new | blank |) (private | incognito) window (for me|)",
            " open(?: a|)(?: new| blank|)(?: private| incognito) window(?: for me|)"
        )
        testParseHelper(
            "new (private | incognito) window",
            " new(?: private| incognito) window"
        )
        testParseHelper(
            "open window",
            " open window"
        )
        testParseHelper(
            "(open | launch) (a |) (new | blank |) window (for me|)",
            "(?: open| launch)(?: a|)(?: new| blank|) window(?: for me|)"
        )
        testParseHelper(
            "new (blank |) window",
            " new(?: blank|) window"
        )
        testParseHelper(
            "pin (this |) tab (for me |)",
            " pin(?: this|) tab(?: for me|)"
        )
        testParseHelper(
            "(reload | refresh) (this | current |) (tab | page |) (for me |)",
            "(?: reload| refresh)(?: this| current|)(?: tab| page|)(?: for me|)"
        )
        testParseHelper(
            "save (this | current |) (tab |) (as |) pdf (for me |)",
            " save(?: this| current|)(?: tab|)(?: as|) pdf(?: for me|)"
        )
        testParseHelper(
            "unpin (this |) tab (for me |)",
            " unpin(?: this|) tab(?: for me|)"
        )
        testParseHelper(
            "zoom (in |) (this |) (tab |) (for me |)",
            " zoom(?: in|)(?: this|)(?: tab|)(?: for me|)"
        )
        testParseHelper(
            "increase size (for me |)",
            " increase size(?: for me|)"
        )
        testParseHelper(
            "zoom out (this |) (tab |) (for me |)",
            " zoom out(?: this|)(?: tab|)(?: for me|)"
        )
        testParseHelper(
            "decrease size (for me |)",
            " decrease size(?: for me|)"
        )
        testParseHelper(
            "reset (zoom | size) (for me |)",
            " reset(?: zoom| size)(?: for me|)"
        )
        testParseHelper(
            "(zoom | size) reset (for me |)",
            "(?: zoom| size) reset(?: for me|)"
        )
    }
}
