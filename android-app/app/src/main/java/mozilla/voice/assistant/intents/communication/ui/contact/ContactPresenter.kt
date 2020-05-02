package mozilla.voice.assistant.intents.communication.ui.contact

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.ContactsContract
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.loader.app.LoaderManager
import androidx.loader.content.CursorLoader
import androidx.loader.content.Loader
import kotlinx.coroutines.launch
import mozilla.voice.assistant.intents.communication.ContactEntity
import mozilla.voice.assistant.intents.communication.MODE_KEY
import mozilla.voice.assistant.intents.communication.NICKNAME_KEY
import mozilla.voice.assistant.intents.communication.SMS_MODE
import mozilla.voice.assistant.intents.communication.VOICE_MODE
import mozilla.voice.assistant.intents.communication.contactIdToContactEntity
import mozilla.voice.assistant.intents.communication.contactUriToContactEntity

class ContactPresenter(private val contactActivity: ContactActivity) {
    private var contactLoader: ContactLoader? = null
    private val mode = contactActivity.intent.getStringExtra(MODE_KEY)
    private val nickname = contactActivity.intent.getStringExtra(NICKNAME_KEY)
    private val viewModel = ViewModelProvider(
        contactActivity,
        ContactViewModelFactory(
            contactActivity.application,
            mode,
            nickname
        )
    ).get(ContactViewModel::class.java)

    init {
        viewModel.viewModelScope.launch {
            searchDatabaseForNickname()
        }
    }

    private suspend fun searchDatabaseForNickname() {
        // Try to find an exact match in our database.
        viewModel.getContact()?.let {
            initiateRequestedActivity(it)
        } ?: getPermissions() // leads to seekContactsWithNickname()
    }

    internal fun initiateRequestedActivity(contact: ContactEntity) {
        val intent = when (viewModel.mode) {
            VOICE_MODE -> Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel: ${contact.voiceNumber}")
            }
            SMS_MODE -> Intent(
                Intent.ACTION_VIEW,
                Uri.fromParts("sms", contact.smsNumber, null)
            )
            else -> throw AssertionError("Illegal mode: ${viewModel.mode}")
        }
        contactActivity.startActivity(intent)
        contactActivity.finish()
    }

    private fun getPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
            contactActivity.checkSelfPermission(Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED
        ) {
            contactActivity.requestPermissions(
                arrayOf(Manifest.permission.READ_CONTACTS),
                ContactActivity.PERMISSIONS_REQUEST
            )
        } else {
            seekContactsWithNickname()
        }
    }

    internal fun onRequestPermissionsResult(grantResults: IntArray) {
        if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            seekContactsWithNickname()
        } else {
            contactActivity.reportPermissionsDenial()
        }
    }

    private fun seekContactsWithNickname() {
        ContactLoader().let {
            contactLoader = it
            LoaderManager.getInstance(contactActivity).initLoader(0, null, it)
        }
    }

    internal fun addContact(contactEntity: ContactEntity) {
        viewModel.insert(contactEntity)
    }

    internal fun onContactChosen(contactUri: Uri) {
        contactUriToContactEntity(contactActivity, nickname, contactUri)
            .let { contactEntity ->
                addContact(contactEntity)
                initiateRequestedActivity(contactEntity)
            }
    }

    inner class ContactLoader : LoaderManager.LoaderCallbacks<Cursor> {
        override fun onCreateLoader(loaderId: Int, args: Bundle?): Loader<Cursor> {
            val nickname = viewModel.nickname
            return CursorLoader(
                contactActivity,
                ContactsContract.Contacts.CONTENT_URI,
                PROJECTION,
                SELECTION,
                arrayOf(
                    nickname, // just the nickname
                    "$nickname %", // first name
                    "% $nickname", // last name
                    "% $nickname %" // middle name
                ),
                null
            )
        }

        override fun onLoadFinished(loader: Loader<Cursor>, cursor: Cursor) {
            when (cursor.count) {
                0 -> run {
                    cursor.close()
                    contactActivity.processZeroContacts()
                }
                1 -> cursor.use {
                    it.moveToNext()
                    contactIdToContactEntity(
                        contactActivity,
                        nickname,
                        it.getLong(CONTACT_ID_INDEX)
                    ).let { contactEntity ->
                        addContact(contactEntity)
                        initiateRequestedActivity(contactEntity)
                    }
                }
                else -> contactActivity.processMultipleContacts(cursor) // cursor closed by callee
            }
        }

        override fun onLoaderReset(loader: Loader<Cursor>) {}
    }

    companion object {
        private val PROJECTION: Array<out String> = arrayOf(
            ContactsContract.Contacts._ID,
            ContactsContract.Contacts.LOOKUP_KEY,
            ContactsContract.Contacts.DISPLAY_NAME_PRIMARY,
            ContactsContract.Contacts.PHOTO_THUMBNAIL_URI,
            ContactsContract.Contacts.HAS_PHONE_NUMBER
        )
        private const val TERM = "${ContactsContract.Contacts.DISPLAY_NAME_PRIMARY} LIKE ?"
        private const val NUM_TERMS = 4 // exact match, first name, last name, middle name
        private val SELECTION: String =
            generateSequence { TERM }
                .take(NUM_TERMS)
                .joinToString(separator = " OR ")

        internal const val CONTACT_ID_INDEX = 0
        internal const val CONTACT_LOOKUP_KEY_INDEX = 1
        internal const val CONTACT_DISPLAY_NAME_INDEX = 2
        internal const val CONTACT_PHOTO_URI_INDEX = 3
        internal const val CONTACT_HAS_PHONE_NUMBER = 4
    }
}
