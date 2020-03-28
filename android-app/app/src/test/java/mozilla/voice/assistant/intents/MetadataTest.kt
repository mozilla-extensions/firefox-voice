package mozilla.voice.assistant.intents

import android.content.Context
import android.content.pm.ActivityInfo
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import mozilla.voice.assistant.language.Language
import mozilla.voice.assistant.language.LanguageTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class MetadataTest {
    private lateinit var metadata: Metadata
    private val language = LanguageTest.getLanguage()

    @BeforeEach
    fun setup() {
        metadata = getMetadata(LanguageTest.getLanguage(STOPWORDS))
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
                it.second,
                metadata.getPackageForAppName(it.first),
                "expected metadata.getPackageForAppName(\"${it.first}\") to return \"${it.second}\""
            )
        }
    }

    companion object {
        private const val STOPWORDS = "be for my please the"
        private val apps = listOf(
            Pair("Be My Eyes", "com.bemyeyes"),
            Pair("The Eyes", "org.theeyes"),
            Pair("Eyes", "org.eyes"),
            Pair("Washington Post", "com.wapo"),
            Pair("My My", "com.mymy")
        )

        // TODO: Populate these data structures.
        private val appInfo = mutableMapOf<String, ApplicationInfo>() // for mocking pm.getApplicationInfo()
        private val appLabels = mutableMapOf<ApplicationInfo, String>() // for mocking pm.getApplicationLabel()

        internal fun getMetadata(language: Language = LanguageTest.getLanguage()): Metadata {
            val context = mockk<Context>(relaxed = true)
            val pm = mockk<PackageManager>(relaxed = true)
            every { context.packageManager } returns pm
            val resolveInfoList = apps.map {
                makeResolveInfo(it.first, it.second)
            }
            every { pm.queryIntentActivities(any(), any()) } returns resolveInfoList
            val packageName = slot<String>()
            every { pm.getApplicationInfo(capture(packageName), 0) } answers { appInfo[packageName.captured] }
            val appInfo = slot<ApplicationInfo>()
            every { pm.getApplicationLabel(capture(appInfo)) } answers { appLabels[appInfo.captured] }
            return Metadata(context, language)
        }

        private fun makeResolveInfo(appName: String, packageName: String, exported: Boolean = true):
                ResolveInfo {
            val activityInfo = mockk<ActivityInfo>(relaxed = true)
            activityInfo.exported = exported
            activityInfo.packageName = packageName
            val resolveInfo = mockk<ResolveInfo>(relaxed = true)
            resolveInfo.activityInfo = activityInfo
            val applicationInfo = mockk<ApplicationInfo>()
            appInfo[packageName] = applicationInfo
            appLabels[applicationInfo] = appName
            return resolveInfo
        }
    }
}
