package mozilla.voice.assistant.intents.communication.ui.contact

import android.app.Activity
import android.content.Intent
import android.database.Cursor
import android.os.Bundle
import android.provider.ContactsContract
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.android.synthetic.main.contact_activity.*
import mozilla.voice.assistant.R
import mozilla.voice.assistant.intents.communication.NICKNAME_KEY

class ContactActivity : AppCompatActivity() {
    private lateinit var presenter: ContactPresenter
    private lateinit var nickname: String

    private var cursorAdapter: RecyclerView.Adapter<ContactCursorAdapter.ContactViewHolder>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.contact_activity)
    }

    override fun onStart() {
        super.onStart()
        nickname = intent.getStringExtra(NICKNAME_KEY)
        presenter = ContactPresenter(this)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == PERMISSIONS_REQUEST) {
            presenter.onRequestPermissionsResult(grantResults)
        }
    }

    internal fun reportPermissionsDenial() {
        Toast.makeText(this, "Unable to proceed without permissions", Toast.LENGTH_LONG)
            .show()
    }

    internal fun processZeroContacts() {
        // contactsViewAnimator.displayedChild = R.id.noContactsButton
        contactsCheckBox.visibility = View.VISIBLE

        contactStatusView.text = getString(R.string.no_contacts, nickname)
        contactsViewAnimator.showNext()
        noContactsButton.setOnClickListener {
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

    internal fun processMultipleContacts(cursor: Cursor) {
        //   contactsViewAnimator.displayedChild = R.id.contactsList
        contactsCheckBox.visibility = View.VISIBLE
        contactStatusView.text = getString(R.string.multiple_contacts, nickname)
        ContactCursorAdapter(this, nickname, cursor, presenter).let { contactCursorAdapter ->
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
            // TODO: Handle other cases
            if (resultCode == Activity.RESULT_OK) {
                data?.data?.let {
                    presenter.onContactChosen(it)
                }
            }
        }
    }

    companion object {
        internal const val PERMISSIONS_REQUEST = 100
        private const val SELECT_CONTACT_FOR_NICKNAME = 1
    }
}
