package mozilla.voice.assistant.intents

import android.content.Context
import android.content.pm.ActivityInfo
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.mockk
import mozilla.voice.assistant.language.LanguageTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class MetadataTest {
    private lateinit var metadata: Metadata
    private val language = LanguageTest.getLanguage()

    @BeforeEach
    fun initialize() {
        MockKAnnotations.init(this)
        metadata = getMetadata()
    }

    @Test
    fun testGetPackageForAppName() {
        // These apps should not be present
        assertNull(metadata.getPackageForAppName("private")) // not exported
        assertNull(metadata.getPackageForAppName("nonexistent"))

        language.addStopwords("the please for me be my")
        listOf(
            "Stack Exchange",
            "The Stack Exchange",
            "stack the exchange",
            "stack exchange for me please"
        ).forEach {
            assertEquals("com.stackexchange.marvin", metadata.getPackageForAppName(it))
        }
        listOf(
            "Be my eyes",
            "be my eyes please",
            "eyes"
        ).forEach {
            assertEquals("com.bemyeyes.bemyeyes", metadata.getPackageForAppName(it))
        }
    }

    private val appNames = mutableMapOf<String, String>() // package name -> app name

    private fun getMetadata(): Metadata {
        val context = mockk<Context>(relaxed = true)
        val pm = mockk<PackageManager>(relaxed = true)
        every { context.packageManager } returns pm
        val resolveInfoList = listOf(
            makeResolveInfo("Stack Exchange", "com.stackexchange.marvin"),
            makeResolveInfo("Washington Post", "com.washingtonpost.android"),
            makeResolveInfo("Be My Eyes", "com.bemyeyes.bemyeyes"),
            makeResolveInfo("private", "foo.bar.com", exported = false)
        )
        every { pm.queryIntentActivities(any(), any()) } returns resolveInfoList
        return Metadata(context, LanguageTest.getLanguage())
    }

    private fun makeResolveInfo(appName: String, packageName: String, exported: Boolean = true):
            ResolveInfo {
        val activityInfo = mockk<ActivityInfo>(relaxed = true)
        every { activityInfo.exported } returns exported
        every { activityInfo.packageName } returns packageName
        appNames[packageName] = appName
        val resolveInfo = mockk<ResolveInfo>(relaxed = true)
        every { resolveInfo.activityInfo } returns activityInfo
        return resolveInfo
    }
}
