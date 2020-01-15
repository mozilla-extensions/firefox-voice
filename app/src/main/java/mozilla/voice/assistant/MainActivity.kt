package mozilla.voice.assistant

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.speech.RecognizerIntent
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_main.*
import java.net.URLEncoder

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        startSpeechRecognizer()
    }

    private fun startSpeechRecognizer() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        intent.putExtra(
            RecognizerIntent.EXTRA_LANGUAGE_MODEL,
            // The choices of model are FREE_FORM or WEB_SEARCH
            RecognizerIntent.LANGUAGE_MODEL_WEB_SEARCH
        )
        startActivityForResult(intent, SPEECH_RECOGNITION_REQUEST)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == SPEECH_RECOGNITION_REQUEST) {
            if (resultCode == RESULT_OK && data is Intent) {
                data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS) ?.let {
                    if (it.size > 0) {
                        textView.text = "Sending '${it[0]}"
                        val url = "${BASE_URL}${URLEncoder.encode(it[0], ENCODING)}"
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    } else {
                        textView.text = "No text returned"
                    }
                }
            } else {
                textView.text = "Request failed"
            }
        }
    }

    companion object {
        internal const val SPEECH_RECOGNITION_REQUEST = 1
        internal const val BASE_URL = "https://mozilla.github.io/firefox-voice/assets/execute.html?text="
        internal const val ENCODING = "UTF-8"
    }
}