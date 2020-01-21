package mozilla.voice.assistant

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_main.*
import java.net.URLEncoder

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        textView.text = ""
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissions(
                arrayOf(
                    Manifest.permission.RECORD_AUDIO
                ),
                PERMISSIONS_REQUEST_CODE
            )
        }
    }

    inner class Listener : RecognitionListener {
        override fun onResults(results: Bundle?) {
            results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.let {
                handleResults(it)
            }
        }

        override fun onBeginningOfSpeech() {}

        override fun onBufferReceived(buffer: ByteArray?) {}

        override fun onEndOfSpeech() {}

        override fun onError(error: Int) {
            Log.e(TAG, "err: $error")
        }

        override fun onEvent(eventType: Int, params: Bundle?) {}

        override fun onPartialResults(partialResults: Bundle?) {}

        override fun onReadyForSpeech(params: Bundle?) {}

        override fun onRmsChanged(rmsdB: Float) {}
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSIONS_REQUEST_CODE) {
            if (grantResults.size != 1 || grantResults[0] != PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(
                    this,
                    "Permissions denied",
                    Toast.LENGTH_LONG
                )
            } else {
                startSpeechRecognition()
            }
        }
    }

    private fun startSpeechRecognition() {
        val recognizer = SpeechRecognizer.createSpeechRecognizer(this)
        recognizer.setRecognitionListener(Listener())
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        intent.putExtra(
            RecognizerIntent.EXTRA_LANGUAGE_MODEL,
            RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
        )
        recognizer.startListening(intent)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == SPEECH_RECOGNITION_REQUEST) {
            if (resultCode == RESULT_OK && data is Intent) {
                data?.let {
                    handleResults(
                        it.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                    )
                    return
                }
            }
            textView.text = "Request failed"
        }
    }

    private fun handleResults(results: List<String>) {
        results.let {
            if (it.size > 0) {
                textView.text = "Sending '${it[0]}"
                val url = "${BASE_URL}${URLEncoder.encode(it[0], ENCODING)}"
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
            } else {
                textView.text = "No text returned"
            }
        }
    }

    companion object {
        internal const val SPEECH_RECOGNITION_REQUEST = 1
        internal const val PERMISSIONS_REQUEST_CODE = 1
        internal const val BASE_URL =
            "https://mozilla.github.io/firefox-voice/assets/execute.html?text="
        internal const val ENCODING = "UTF-8"
        internal const val TAG = "MainActivity"
    }
}