package mozilla.voice.assistant.intents

import android.content.Context
import android.content.pm.PackageManager
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock

class MetadataTest {
    companion object {
        internal fun getMetadata(): Metadata {
            val context = mock(Context::class.java)
            val pm = mock(PackageManager::class.java)
            `when`(context.packageManager).thenReturn(pm)
            `when`(
                pm.queryIntentActivities(
                    any(android.content.Intent::class.java), anyInt()
                )
            ).thenReturn(emptyList())
            return Metadata(context)
        }
    }
}
