package mozilla.voice.assistant.intents.communication

import android.content.Context
import android.content.Intent
import android.net.Uri
import mozilla.voice.assistant.intents.Metadata
import mozilla.voice.assistant.intents.ParseResult
import mozilla.voice.assistant.intents.communication.ui.contact.ContactActivity

class PhoneCall {
    companion object {
        private const val NAME_KEY = "name"
        private const val PHONE_NUMBER_KEY = "number"

        internal fun getIntents() = listOf(
            // call.number must precede call.name so numbers aren't mistaken for names
            Pair(
                "call.number",
                ::createPhoneCallNumberIntent
            ),
            Pair(
                "call.name",
                ::createPhoneCallNameIntent
            )
        )

        private fun createPhoneCallNameIntent(
            pr: ParseResult,
            context: Context?,
            @Suppress("UNUSED_PARAMETER") metadata: Metadata
        ): Intent? =
            pr.slots[NAME_KEY]?.let { name ->
                ContactActivity.createCallIntent(
                    requireNotNull(context),
                    name
                )
            }

        private fun createPhoneCallNumberIntent(
            pr: ParseResult,
            @Suppress("UNUSED_PARAMETER") context: Context?,
            @Suppress("UNUSED_PARAMETER") metadata: Metadata
        ) = pr.slots[PHONE_NUMBER_KEY]?.let {
            Intent(
                Intent.ACTION_DIAL,
                Uri.parse("tel:$it")
            )
        }
    }
}
