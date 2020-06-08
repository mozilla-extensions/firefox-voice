package mozilla.voice.assistant.intents.communication

import android.database.Cursor
import android.net.Uri
import android.provider.ContactsContract
import android.provider.ContactsContract.CommonDataKinds.Phone
import mozilla.voice.assistant.intents.communication.ui.contact.ContactActivityInterface

const val DUMMY_NICKNAME = "!@@!"

private val columns = arrayOf(
    Phone.DISPLAY_NAME,
    ContactsContract.Data.LOOKUP_KEY,
    Phone.NORMALIZED_NUMBER,
    ContactsContract.Data.DATA2,
    Phone.IS_PRIMARY,
    Phone.IS_SUPER_PRIMARY
)

internal fun contactUriToContactEntity(
    contactActivity: ContactActivityInterface,
    nickname: String?,
    contactUri: Uri
): ContactEntity = contactActivity.app.applicationContext.contentResolver?.query(
        contactUri,
        columns,
        null,
        null,
        null
    )?.let { cursor ->
        resolverCursorToContentEntity(
            cursor,
            nickname ?: DUMMY_NICKNAME
        )
    } ?: throw AssertionError("Unable to access contentResolver")

internal fun contactIdToContactEntity(
    contactActivity: ContactActivityInterface,
    nickname: String?,
    contactId: Long
): ContactEntity =
    // https://learning.oreilly.com/library/view/android-cookbook-2nd/9781449374471/ch10.html
    contactActivity.app.applicationContext.contentResolver?.query(
        Phone.CONTENT_URI,
        columns,
        "${Phone.CONTACT_ID}=?",
        arrayOf(contactId.toString()),
        null
    )?.let { cursor ->
        resolverCursorToContentEntity(
            cursor,
            nickname ?: DUMMY_NICKNAME
        )
    } ?: throw AssertionError("Unable to access contentResolver")

private fun resolverCursorToContentEntity(
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
            contactNumbers.maxBy { it.getScore(SMS_MODE) }?.number,
            contactNumbers.maxBy { it.getScore(VOICE_MODE) }?.number
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
                mode == SMS_MODE && (type == Phone.TYPE_MOBILE || type == Phone.TYPE_MMS),
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
