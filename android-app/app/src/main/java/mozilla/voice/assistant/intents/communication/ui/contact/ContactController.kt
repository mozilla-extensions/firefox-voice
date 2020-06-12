package mozilla.voice.assistant.intents.communication.ui.contact

import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.loader.app.LoaderManager
import androidx.loader.content.Loader
import kotlinx.coroutines.launch
import mozilla.voice.assistant.intents.communication.ContactEntity
import mozilla.voice.assistant.intents.communication.DUMMY_NICKNAME
import mozilla.voice.assistant.intents.communication.SMS_MODE
import mozilla.voice.assistant.intents.communication.VOICE_MODE
import mozilla.voice.assistant.intents.communication.contactIdToContactEntity
import mozilla.voice.assistant.intents.communication.contactUriToContactEntity

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
    private val contactActivity: ContactActivityInterface,
    mode: String,
    nickname: String?,
    payload: String?
) {
    private var contactLoader: ContactLoader? = null
    private val viewModel = ViewModelProvider(
        contactActivity,
        ContactViewModelFactory(
            contactActivity.app,
            mode,
            nickname,
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

    fun initiateRequestedActivity(contact: ContactEntity) {
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
                        ContactViewModel.extractMessage(it, contact.name)
                    )
                }
            }
            else -> throw AssertionError("Illegal mode: ${viewModel.mode}")
        }
        contactActivity.startIntent(intent)
    }

    private fun getPermissions() {
        if (!contactActivity.permissionsNeeded()) {
            seekContactsWithNickname()
        }
    }

    fun onRequestPermissionsResult(grantResults: IntArray) {
        if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
            seekContactsWithNickname()
        } else {
            contactActivity.reportPermissionsDenial()
        }
    }

    private fun seekContactsWithNickname() {
        ContactLoader().let {
            contactLoader = it
            LoaderManager.getInstance(contactActivity)
                .initLoader(
                    CONTACT_LOADER_ID,
                    null,
                    it
                )
        }
    }

    fun addContact(contactEntity: ContactEntity) {
        if (contactEntity.nickname != DUMMY_NICKNAME) viewModel.insert(contactEntity)
    }

    fun onContactChosen(contactUri: Uri, save: Boolean) {
        contactUriToContactEntity(contactActivity, viewModel.nickname, contactUri)
            .let { contactEntity ->
                if (save) addContact(contactEntity)
                initiateRequestedActivity(contactEntity)
            }
    }

    fun handleZeroContacts(cursor: Cursor) {
        // Don't close cursor here, in case a configuration change occurs after
        // processZeroContacts() is called but before the contact picker is opened
        // (issue 1628). Instead, it will be called just before opening the picker.
        contactActivity.processZeroContacts(cursor, viewModel.nickname)
    }

    fun handleSingleContact(cursor: Cursor) {
        cursor.use {
            it.moveToNext()
            initiateRequestedActivity(
                contactIdToContactEntity(
                    contactActivity,
                    viewModel.nickname,
                    it.getLong(CONTACT_ID_INDEX)
                )
            )
        }
    }

    /**
     * Loads contacts matching the given nickname (or payload) and dispatches based on
     * the number of contacts returned.
     */
    inner class ContactLoader : LoaderManager.LoaderCallbacks<Cursor> {
        override fun onCreateLoader(loaderId: Int, args: Bundle?) =
            viewModel.toCursorLoader(contactActivity.app)

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
        internal const val CONTACT_ID_INDEX = 0
        internal const val CONTACT_DISPLAY_NAME_INDEX = 1
        internal const val CONTACT_PHOTO_URI_INDEX = 2

        internal const val CONTACT_LOADER_ID = 100
    }
}
