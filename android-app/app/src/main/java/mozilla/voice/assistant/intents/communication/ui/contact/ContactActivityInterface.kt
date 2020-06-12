package mozilla.voice.assistant.intents.communication.ui.contact

import android.app.Application
import android.content.Intent
import android.database.Cursor
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewModelStoreOwner

/**
 * Interface for an activity to be controlled by [ContactController].
 */
interface ContactActivityInterface : LifecycleOwner, ViewModelStoreOwner {
    val app: Application

    /**
     * Satisfy the user request by starting the given intent.
     */
    fun startIntent(newIntent: Intent)

    /**
     * Determine whether a permission request is needed and, if so, make the request
     * and call [ContactController.onRequestPermissionsResult] later with the result.
     *
     * @return true if a permission request is needed, false otherwise
     */
    fun permissionsNeeded(): Boolean

    /**
     * Update the view to indicate that execution cannot continue due to permissions
     * not being granted.
     */
    fun reportPermissionsDenial()

    /**
     * Handle the case where the given nickname was not found in the Android
     * contacts database, as indicated by the given cursor, which must be closed
     * when the request is fully satisfied.
     */
    fun processZeroContacts(cursor: Cursor, nickname: String?)

    /**
     * Have the user choose among multiple contacts that are possible matches
     * for the given nickname. This method must close the given cursor.
     */
    fun processMultipleContacts(cursor: Cursor, nickname: String?)
}
