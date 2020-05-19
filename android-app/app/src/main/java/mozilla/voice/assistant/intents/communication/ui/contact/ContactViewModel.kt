package mozilla.voice.assistant.intents.communication.ui.contact

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
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
}
