package mozilla.voice.assistant

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        if (Intent.ACTION_ASSIST.equals(intent.action)) {
            textView.text = "Opened through Intent.ACTION_ASSIST"
        } else {
            textView.text = "Opened through launcher"
        }
    }
}