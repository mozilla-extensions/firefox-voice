package mozilla.voice.assistant.intents.communication.ui.contact

import android.database.Cursor
import android.net.Uri
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import mozilla.voice.assistant.R
import mozilla.voice.assistant.intents.communication.contactIdToContactEntity

/**
 * An adapter used when there are multiple matches in the Android contact database
 * for the requested nickname, enabling the user to specify their choice.
 */
class ContactCursorAdapter(
    private val contactActivity: ContactActivity,
    private val nickname: String?,
    private val cursor: Cursor,
    private val controller: ContactController
) : RecyclerView.Adapter<ContactCursorAdapter.ContactViewHolder>() {
    inner class ContactViewHolder(private val listItemView: View) :
        RecyclerView.ViewHolder(listItemView), View.OnClickListener {
        internal val ivContactPhoto = itemView.findViewById<ImageView>(R.id.ivContactPhoto)
        internal val tvContactDisplayName = itemView.findViewById<TextView>(R.id.tvContactDisplayName)

        init {
            itemView.setOnClickListener(this)
        }

        override fun onClick(p0: View?) {
            if (adapterPosition != RecyclerView.NO_POSITION) {
                cursor.use {
                    it.moveToPosition(adapterPosition)
                    val contactEntity = contactIdToContactEntity(
                        contactActivity,
                        nickname,
                        it.getLong(ContactController.CONTACT_ID_INDEX)
                    )
                    if (contactActivity.findViewById<CheckBox>(R.id.contactsCheckBox).isChecked) {
                        controller.addContact(contactEntity)
                    }
                    controller.initiateRequestedActivity(contactEntity)
                }
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ContactViewHolder(
            LayoutInflater.from(parent.context).inflate(R.layout.contact_list_item, parent, false)
        )

    override fun onBindViewHolder(viewHolder: ContactViewHolder, position: Int) {
        cursor.moveToPosition(position)
        cursor.getString(ContactController.CONTACT_PHOTO_URI_INDEX)?.let { photoString ->
            viewHolder.ivContactPhoto.setImageURI(Uri.parse(photoString))
        }
        viewHolder.tvContactDisplayName.text =
            cursor.getString(ContactController.CONTACT_DISPLAY_NAME_INDEX)
    }

    override fun getItemCount() = cursor.count
}
