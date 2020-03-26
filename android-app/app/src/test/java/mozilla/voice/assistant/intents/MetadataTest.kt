package mozilla.voice.assistant.intents

import android.content.Context
import android.content.pm.PackageManager
import mozilla.voice.assistant.language.Language
import mozilla.voice.assistant.language.LanguageTest
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock

class MetadataTest {
    private lateinit var metadata: Metadata

    @Before
    fun setup() {
        metadata = getMetadata(LanguageTest.getLanguage(STOPWORDS))
        metadata.buildAppMap(apps)
    }

    @Test
    fun testBuildAppMap() {
        apps.map {
            assertEquals(it.second, metadata.appMap[it.first.toLowerCase()])
        }
        assertEquals(3, metadata.unstoppedAppMap.size)
        assertEquals(setOf("be my eyes", "the eyes", "eyes"), metadata.unstoppedAppMap["eyes"]?.toSet())
        assertEquals(listOf("washington post"), metadata.unstoppedAppMap["washington post"])
        assertEquals(listOf("my my"), metadata.unstoppedAppMap[""])
    }

    @Test
    fun testGetPackageForAppNameNoStopwords() {
        apps.map {
            assertEquals(it.second, metadata.getPackageForAppName(it.first))
        }
    }

    @Test
    fun testGetForAppNameWithStopwords() {
        // stopwords are: be, my, please, the
        listOf(
            "the Washington post" to "com.wapo",
            "be my eyes" to "com.bemyeyes",
            "please be my eyes" to "com.bemyeyes",
            "the eyes please" to "org.theeyes",
            "eyes please" to "org.eyes",
            "my my my" to "com.mymy"
        ).map {
            assertEquals(
                "expected metadata.getPackageForAppName(\"${it.first}\") to return \"${it.second}\"",
                it.second,
                metadata.getPackageForAppName(it.first))
        }
    }

    companion object {
        internal fun getMetadata(language: Language): Metadata {
            val context = mock(Context::class.java)
            val pm = mock(PackageManager::class.java)
            `when`(context.packageManager).thenReturn(pm)
            `when`(
                pm.queryIntentActivities(
                    any(android.content.Intent::class.java), anyInt()
                )
            ).thenReturn(emptyList())
            return Metadata(context, language)
        }
        private const val STOPWORDS = "be my please the"
        private val apps = listOf(
            Pair("Be My Eyes", "com.bemyeyes"),
            Pair("The Eyes", "org.theeyes"),
            Pair("Eyes", "org.eyes"),
            Pair("Washington Post", "com.wapo"),
            Pair("My My", "com.mymy")
        )
    }
}
