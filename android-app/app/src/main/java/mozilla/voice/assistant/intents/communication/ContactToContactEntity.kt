package mozilla.voice.assistant.intents.communication

import android.database.Cursor
import android.net.Uri
import android.provider.ContactsContract
import android.provider.ContactsContract.CommonDataKinds.Phone
import mozilla.voice.assistant.intents.communication.ui.contact.ContactActivity

private val columns = arrayOf(
    Phone.DISPLAY_NAME,
    ContactsContract.Data.LOOKUP_KEY,
    Phone.NORMALIZED_NUMBER,
    ContactsContract.Data.DATA2,
    Phone.IS_PRIMARY,
    Phone.IS_SUPER_PRIMARY
)

internal fun contactUriToContactEntity(
    contactActivity: ContactActivity,
    contactUri: Uri
): ContactEntity =
    contactActivity.contentResolver?.let { resolver ->
        cursorToContentEntity(
            resolver.query(
                contactUri,
                columns,
                null,
                null,
                null
            ),
            contactActivity.viewModel.nickname
        )
    } ?: throw AssertionError("Unable to access contentResolver")

internal fun contactIdToContactEntity(
    contactActivity: ContactActivity,
    contactId: Long
): ContactEntity =
    // https://learning.oreilly.com/library/view/android-cookbook-2nd/9781449374471/ch10.html
    contactActivity.contentResolver?.let { resolver ->
        cursorToContentEntity(
            resolver.query(
                Phone.CONTENT_URI,
                columns,
                "${Phone.CONTACT_ID}=?",
                arrayOf(contactId.toString()),
                null
            ),
            contactActivity.viewModel.nickname
        )
    } ?: throw AssertionError("Unable to access contentResolver")

private fun cursorToContentEntity(
    cursor: Cursor,
    nickname: String
): ContactEntity {
    cursor.moveToFirst()
    val name = cursor.getString(cursor.getColumnIndex(Phone.DISPLAY_NAME))
    val lookupKey = cursor.getString(cursor.getColumnIndex(ContactsContract.Data.LOOKUP_KEY))
    return (1..cursor.count).map {
        ContactNumber(
            cursor.getString(cursor.getColumnIndex(Phone.NORMALIZED_NUMBER)),
            cursor.getInt(cursor.getColumnIndex(ContactsContract.Data.DATA2)),
            cursor.getInt(cursor.getColumnIndex(Phone.IS_PRIMARY)) > 0,
            cursor.getInt(cursor.getColumnIndex(Phone.IS_SUPER_PRIMARY)) > 0
        ).also {

            cursor.moveToNext()
        }
    }.let { contactNumbers ->
        ContactEntity(
            nickname,
            name,
            lookupKey,
            contactNumbers.maxBy { it.getScore(ContactActivity.SMS_MODE) }?.number,
            contactNumbers.maxBy { it.getScore(ContactActivity.VOICE_MODE) }?.number
        )
    }
}

private data class ContactNumber(
    val number: String,
    private val type: Int,
    private val isPrimary: Boolean,
    private val isSuperPrimary: Boolean
) {
    internal fun getScore(mode: String) =
        listOf(
            Pair(isPrimary, PRIMARY_BONUS),
            Pair(isSuperPrimary, SUPER_PRIMARY_BONUS),
            Pair(
                mode == ContactActivity.SMS_MODE &&
                        (type == Phone.TYPE_MOBILE || type == Phone.TYPE_MMS),
                MOBILE_BONUS_FOR_SMS
            )
        ).sumBy {
            if (it.first) it.second else 0
        }

    companion object {
        private const val MOBILE_BONUS_FOR_SMS = 10
        private const val PRIMARY_BONUS = 1
        private const val SUPER_PRIMARY_BONUS = 2
    }
}
