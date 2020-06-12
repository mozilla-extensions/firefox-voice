package mozilla.voice.assistant.intents.communication

import android.content.Context
import android.content.Intent
import android.net.Uri
import mozilla.voice.assistant.intents.Metadata
import mozilla.voice.assistant.intents.ParseResult
import mozilla.voice.assistant.intents.communication.ui.contact.ContactActivity

class TextMessage {
    companion object {
        private const val NAME_KEY = "name"
        private const val PHONE_NUMBER_KEY = "number"
        private const val PAYLOAD_KEY = "payload"

        internal fun getIntents() = listOf(
            // sms.number must precede sms.name so numbers aren't misinterpreted
            // as names.
            Pair(
                "sms.number",
                ::createTextMessageNumberIntent
            ),
            Pair(
                "sms.name",
                ::createTextMessageNameIntent
            ),
            Pair(
                "sms.payload",
                ::createTextMessagePayloadIntent
            )
        )

        private fun createTextMessageNumberIntent(
            pr: ParseResult,
            @Suppress("UNUSED_PARAMETER") context: Context?,
            @Suppress("UNUSED_PARAMETER") metadata: Metadata
        ) = pr.slots[PHONE_NUMBER_KEY]?.let { number ->
                Intent(
                    Intent.ACTION_VIEW,
                    Uri.fromParts("sms", number, null)
                )
            }

        private fun createTextMessageNameIntent(
            pr: ParseResult,
            context: Context?,
            @Suppress("UNUSED_PARAMETER") metadata: Metadata
        ) = pr.slots[NAME_KEY]?.let { name ->
                ContactActivity.createSmsIntent(requireNotNull(context), nickname = name)
            }

        private fun createTextMessagePayloadIntent(
            pr: ParseResult,
            context: Context?,
            @Suppress("UNUSED_PARAMETER") metadata: Metadata
        ) = pr.slots[PAYLOAD_KEY]?.let { payload ->
            ContactActivity.createSmsIntent(
                requireNotNull(context),
                nickname = null,
                payload = payload
            )
        }
    }
}
