package mozilla.voice.assistant.intents.communication.ui.contact

import android.content.Context
import android.database.Cursor
import android.net.Uri
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.cursoradapter.widget.CursorAdapter
import mozilla.voice.assistant.R

class ContactCursorAdapter(
    context: Context,
    cursor: Cursor
) : CursorAdapter(context, cursor, 0) {
    override fun newView(context: Context?, cursor: Cursor?, parent: ViewGroup?) =
        LayoutInflater.from(context).inflate(R.layout.contact_list_item, parent, false)

    override fun bindView(view: View?, context: Context?, cursor: Cursor?) {
        cursor?.let {
            val displayName = it.getString(ContactActivity.CONTACT_DISPLAY_NAME_INDEX)
            val displayNameView = view?.findViewById<TextView>(R.id.tvContactDisplayName)
            displayNameView?.text = displayName
            val iconView = view?.findViewById<ImageView>(R.id.ivContactPhoto)
            // Before adding the below statement, the wrong image was sometimes displayed.
            // https://stackoverflow.com/a/50640970/631051
            iconView?.setImageURI(null)
            it.getString(ContactActivity.CONTACT_PHOTO_URI_INDEX)?.let { photoString ->
                iconView?.setImageURI(Uri.parse(photoString))
            }
        }
    }
}
