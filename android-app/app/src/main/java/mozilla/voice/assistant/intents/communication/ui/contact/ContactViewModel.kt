package mozilla.voice.assistant.intents.communication.ui.contact

import android.app.Application
import android.provider.ContactsContract
import androidx.annotation.VisibleForTesting
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.loader.content.CursorLoader
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import mozilla.voice.assistant.intents.communication.ContactDatabase
import mozilla.voice.assistant.intents.communication.ContactEntity
import mozilla.voice.assistant.intents.communication.ContactRepository

class ContactViewModelFactory(
    private val application: Application,
    private val mode: String,
    private val nickname: String,
    private val payload: String?
) : ViewModelProvider.Factory {
    override fun <T : ViewModel?> create(modelClass: Class<T>): T =
        modelClass.getConstructor(
            Application::class.java,
            String::class.java,
            String::class.java,
            String::class.java
        ).newInstance(application, mode, nickname, payload)
}

class ContactViewModel(
    application: Application,
    val mode: String,
    var nickname: String,
    val payload: String?
) : AndroidViewModel(application) {
    private val repository: ContactRepository

    init {
        val contactsDao = ContactDatabase.getDatabase(
            application,
            viewModelScope
        ).contactDao()
        repository =
            ContactRepository(
                contactsDao
            )
    }

    suspend fun getContact(contactNickname: String = nickname) =
        withContext(Dispatchers.IO) {
            repository.get(contactNickname)
        }

    fun insert(contact: ContactEntity) = viewModelScope.launch(Dispatchers.IO) {
        repository.insert(contact)
    }

    @VisibleForTesting
    internal fun comparisonStringsFor(name: String) =
        arrayOf(
            name, // just the nickname
            "$name %", // first name
            "% $name", // last name
            "% $name %" // middle name
        )

    fun toCursorLoader(app: Application) =
        CursorLoader(
            app,
            ContactsContract.Contacts.CONTENT_URI,
            PROJECTION,
            SELECTION,
            comparisonStringsFor(nickname),
            null
        )

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
        internal val SELECTION: String =
            generateSequence { LIKE_TERM }
                .take(NUM_LIKE_TERMS)
                .joinToString(
                    separator = " OR ",
                    prefix = "$HAS_PHONE_TERM AND (",
                    postfix = ")"
                )
    }
}
