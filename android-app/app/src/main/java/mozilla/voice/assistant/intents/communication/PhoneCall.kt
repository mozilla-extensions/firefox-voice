package mozilla.voice.assistant.intents.communication

import android.content.Context
import androidx.annotation.VisibleForTesting
import mozilla.voice.assistant.intents.Metadata
import mozilla.voice.assistant.intents.ParseResult
import mozilla.voice.assistant.intents.communication.ui.contact.ContactActivity

class PhoneCall {
    companion object {
        @VisibleForTesting
        private const val NAME_KEY = "name"

        internal fun getIntents() = listOf(
            Pair(
                "call.name",
                ::createPhoneCallIntent
            )
        )

        private fun createPhoneCallIntent(
            pr: ParseResult,
            context: Context?,
            @Suppress("UNUSED_PARAMETER") metadata: Metadata
        ): android.content.Intent? =
            pr.slots[NAME_KEY]?.let { name ->
                context?.let {
                    ContactActivity.createIntent(it, pr.utterance, name, VOICE_MODE)
                } ?: throw AssertionError("Context unavailable")
            }
    }
}
