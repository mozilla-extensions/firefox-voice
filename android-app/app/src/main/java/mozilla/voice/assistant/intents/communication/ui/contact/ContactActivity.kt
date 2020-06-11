package mozilla.voice.assistant.intents.communication.ui.contact

import android.Manifest
import android.app.Activity
import android.app.Application
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.os.Build
import android.os.Bundle
import android.provider.ContactsContract
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.contact_activity.*
import mozilla.voice.assistant.R
import mozilla.voice.assistant.intents.communication.MODE_KEY
import mozilla.voice.assistant.intents.communication.NICKNAME_KEY
import mozilla.voice.assistant.intents.communication.PAYLOAD_KEY
import mozilla.voice.assistant.intents.communication.SMS_MODE
import mozilla.voice.assistant.intents.communication.VOICE_MODE

/**
 * Activity that initiates a text message or phone call to the specified contact.
 * The mode ([SMS_MODE] or [VOICE_MODE]) is specified through the [MODE_KEY] extra,
 * and the name is specified through either the [NICKNAME_KEY] extra or the [PAYLOAD_KEY] extra,
 * which may also contain a message.
 */
class ContactActivity : AppCompatActivity(), ContactActivityInterface {
    private lateinit var controller: ContactController
    private var cursorAdapter: RecyclerView.Adapter<ContactCursorAdapter.ContactViewHolder>? = null
    override val app: Application
        get() = this.application

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.contact_activity)
    }

    override fun onStart() {
        super.onStart()

        controller = ContactController(
            this,
            intent.getStringExtra(MODE_KEY),
            intent.getStringExtra(NICKNAME_KEY),
            intent.getStringExtra(PAYLOAD_KEY)
        )
        contactCloseButton.setOnClickListener {
            finish()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == PERMISSIONS_REQUEST) {
            controller.onRequestPermissionsResult(grantResults)
        }
    }

    override fun startIntent(newIntent: Intent) {
        startActivity(newIntent)
        finish()
    }

    override fun permissionsNeeded() =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
            checkSelfPermission(Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(
                arrayOf(Manifest.permission.READ_CONTACTS),
                PERMISSIONS_REQUEST
            )
            true
        } else {
            false
        }

    override fun reportPermissionsDenial() {
        Toast.makeText(this, "Unable to proceed without permissions", Toast.LENGTH_LONG)
            .show()
    }

    override fun processZeroContacts(cursor: Cursor, nickname: String?) {
        contactsCheckBox.visibility = if (nickname == null) View.INVISIBLE else View.VISIBLE

        contactStatusView.text = if (nickname == null) {
            getString(R.string.no_contacts)
        } else {
            getString(R.string.no_contacts_with_nickname, nickname)
        }
        contactsViewAnimator.showNext()
        noContactsButton.setOnClickListener {
            cursor.close()
            startContactPicker()
        }
    }

    private fun startContactPicker() {
        startActivityForResult(
            Intent(Intent.ACTION_PICK).apply {
                type = ContactsContract.CommonDataKinds.Phone.CONTENT_TYPE
            },
            SELECT_CONTACT_FOR_NICKNAME
        )
    }

    override fun processMultipleContacts(cursor: Cursor, nickname: String?) {
        contactsCheckBox.visibility = if (nickname == null) View.INVISIBLE else View.VISIBLE
        contactStatusView.text = if (nickname == null) {
            getString(R.string.multiple_contacts)
        } else {
            getString(R.string.multiple_contacts_with_nickname, nickname)
        }
        ContactCursorAdapter(this, nickname, cursor, controller).let { contactCursorAdapter ->
            cursorAdapter = contactCursorAdapter
            findViewById<RecyclerView>(R.id.contactsRecyclerView).apply {
                setHasFixedSize(true)
                adapter = contactCursorAdapter
                layoutManager = LinearLayoutManager(this@ContactActivity)
            }
        }
    }

    @SuppressWarnings("NestedBlockDepth")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == SELECT_CONTACT_FOR_NICKNAME) {
            if (resultCode == Activity.RESULT_OK) {
                data?.data?.let {
                    controller.onContactChosen(
                        it,
                        contactsCheckBox.visibility == View.VISIBLE && contactsCheckBox.isChecked
                    )
                } ?: run {
                    Log.e(TAG, "Unable to retrieve chosen contact")
                    finish()
                }
            }
            if (resultCode == Activity.RESULT_CANCELED) {
                finish()
            }
        }
    }

    companion object {
        private const val TAG = "ContactActivity"
        internal const val PERMISSIONS_REQUEST = 100
        private const val SELECT_CONTACT_FOR_NICKNAME = 1

        private fun createIntent(
            context: Context,
            mode: String,
            nickname: String? = null,
            payload: String? = null
        ) = Intent(context, ContactActivity::class.java).apply {
            putExtra(MODE_KEY, mode)
            nickname?.let { putExtra(NICKNAME_KEY, it) }
            payload?.let { putExtra(PAYLOAD_KEY, it) }
        }

        fun createCallIntent(
            context: Context,
            nickname: String
        ) = createIntent(context, VOICE_MODE, nickname, null)

        fun createSmsIntent(
            context: Context,
            nickname: String? = null,
            payload: String? = null
        ) = createIntent(context, SMS_MODE, nickname, payload)
    }
}
