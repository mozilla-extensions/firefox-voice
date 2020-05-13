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
import mozilla.voice.assistant.intents.communication.SMS_MODE
import mozilla.voice.assistant.intents.communication.VOICE_MODE
import mozilla.voice.assistant.intents.communication.contactIdToContactEntity
import mozilla.voice.assistant.intents.communication.contactUriToContactEntity

private fun String.toComparisonStrings() =
    arrayOf(
        this, // just the nickname
        "$this %", // first name
        "% $this", // last name
        "% $this %" // middle name
    )

private fun String.numWords() = if (this.isEmpty()) 0 else this.split(" ").size

/**
 * The controller for [ContactActivity], which provides a mode
 * ([SMS_MODE] or [VOICE_MODE]) and either a name or payload, the latter of
 * which contains a name and optionally the text to send in the message.
 *
 * The translation from the name (referred to as a "nickname" to distinguish it from
 * an Android contact name) to a phone number is done as follows:
 * 1. If there is an entry corresponding to the nickname in the app's database,
 *    the corresponding phone number stored in the database is used.
 * 2. A lookup is performed among the Android contacts.
 *    a. If no matches are found and there is no payload (see below), the user is prompted
 *       to select a contact and whether to remember the contact.
 *    b. If one match is found, that contact is used, and the database is updated.
 *    c. If multiple contacts are found, the user is asked to choose among them and
 *      whether to remember the contact.
 *
 *  A payload is provided instead of a nickname if the utterance was of the form "text <payload>".
 *  The payload could be just a name (e.g., if the utterance was "text Mary Jones"),
 *  or it could be a name and a message (e.g., "text Jessica pick up the milk").
 *  This is handled by first copying the entire payload into the nickname. If there are zero matches
 *  for the nickname (case 2a), the last word is removed from the nickname, and the process restarts
 *  until there is only a single word remaining in nickname.
 */
class ContactController(
    private val contactActivity: ContactActivity,
    mode: String,
    nickname: String?,
    payload: String?
) {
    private var contactLoader: ContactLoader? = null
    private val viewModel = ViewModelProvider(
        contactActivity,
        ContactViewModelFactory(
            contactActivity.application,
            mode,
            nickname ?: payload ?: throw AssertionError("Both nickname and payload null"),
            payload
        )
    ).get(ContactViewModel::class.java)

    init {
        startDatabaseSearch()
    }

    private fun startDatabaseSearch() {
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
            ).apply {
                viewModel.payload?.let {
                    putExtra(
                        "sms_body",
                        it.substringAfter(viewModel.nickname)
                    )
                }
            }
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
        // If we've already created a ContactLoader, destroy it.
        contactLoader?.let {
            // We use the number of spaces in a nickname as the id of the corresponding loader,
            // so the previous loader has an id one greater than the one we're about to create.
            LoaderManager.getInstance(contactActivity)
                .destroyLoader(viewModel.nickname.numWords() + 1)
        }
        ContactLoader().let {
            contactLoader = it
            LoaderManager.getInstance(contactActivity)
                .initLoader(
                    viewModel.nickname.numWords(), // id of new loader
                    null,
                    it
                )
        }
    }

    internal fun addContact(contactEntity: ContactEntity) {
        viewModel.insert(contactEntity)
    }

    internal fun onContactChosen(contactUri: Uri) {
        contactUriToContactEntity(contactActivity, viewModel.nickname, contactUri)
            .let { contactEntity ->
                addContact(contactEntity)
                initiateRequestedActivity(contactEntity)
            }
    }

    internal fun handleZeroContacts(cursor: Cursor) {
        if (viewModel.payload != null && viewModel.nickname.contains(' ')) {
            // If we get here, we may have copied too much of the payload into
            // the nickname. For example, if the user said "text mary golden hello",
            // we would originally set the nickname to the payload value, "mary golden hello".
            // We should shorten the nickname and try again.
            viewModel.nickname = viewModel.nickname.substringBeforeLast(' ')
            startDatabaseSearch()
        } else {
            // Don't close cursor here, in case a configuration change occurs after
            // processZeroContacts() is called but before the contact picker is opened
            // (issue 1628). Instead, it will be called just before opening the picker.
            contactActivity.processZeroContacts(cursor, viewModel.nickname)
        }
    }

    internal fun handleSingleContact(cursor: Cursor) =
        cursor.use {
            it.moveToNext()
            contactIdToContactEntity(
                contactActivity,
                viewModel.nickname,
                it.getLong(CONTACT_ID_INDEX)
            ).let { contactEntity ->
                addContact(contactEntity)
                initiateRequestedActivity(contactEntity)
            }
        }

    inner class ContactLoader : LoaderManager.LoaderCallbacks<Cursor> {
        override fun onCreateLoader(loaderId: Int, args: Bundle?) =
            CursorLoader(
                contactActivity,
                ContactsContract.Contacts.CONTENT_URI,
                PROJECTION,
                SELECTION,
                viewModel.nickname.toComparisonStrings(),
                null
            )

        override fun onLoadFinished(loader: Loader<Cursor>, cursor: Cursor) {
            when (cursor.count) {
                0 -> handleZeroContacts(cursor)
                1 -> handleSingleContact(cursor)
                else -> contactActivity.processMultipleContacts(cursor, viewModel.nickname)
            }
        }

        override fun onLoaderReset(loader: Loader<Cursor>) {}
    }

    companion object {
        private val PROJECTION: Array<out String> = arrayOf(
            ContactsContract.Contacts._ID,
            ContactsContract.Contacts.DISPLAY_NAME_PRIMARY,
            ContactsContract.Contacts.PHOTO_THUMBNAIL_URI
        )

        // The following statements set up constants for a query to find contacts whose display
        // name either match or contain a nickname provided at run-time.
        private const val HAS_PHONE_TERM = "${ContactsContract.Contacts.HAS_PHONE_NUMBER} = 1"
        private const val LIKE_TERM = "${ContactsContract.Contacts.DISPLAY_NAME_PRIMARY} LIKE ?"
        private const val NUM_LIKE_TERMS = 4 // exact match, first name, last name, middle name
        private val SELECTION: String =
            generateSequence { LIKE_TERM }
                .take(NUM_LIKE_TERMS)
                .joinToString(
                    separator = " OR ",
                    prefix = "$HAS_PHONE_TERM AND (",
                    postfix = ")"
                )

        internal const val CONTACT_ID_INDEX = 0
        internal const val CONTACT_DISPLAY_NAME_INDEX = 1
        internal const val CONTACT_PHOTO_URI_INDEX = 2
    }
}
