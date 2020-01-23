package mozilla.voice.assistant

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.net.URLEncoder
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }

    override fun onStart() {
        super.onStart()
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

    private fun closeRecognizer() {
        recognizer?.stopListening()
        recognizer?.destroy()
        recognizer = null
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
                ).show()
            } else {
                startSpeechRecognition()
            }
        }
    }

    private fun startSpeechRecognition() {
        if (recognizer == null) {
            recognizer = SpeechRecognizer.createSpeechRecognizer(this)
            recognizer?.setRecognitionListener(Listener())
        }
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        intent.putExtra(
            RecognizerIntent.EXTRA_LANGUAGE_MODEL,
            RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
        )
        recognizer?.startListening(intent)
    }

    private fun showReady() {
        animationView.setMinAndMaxFrame(SOLICIT_MIN, SOLICIT_MAX)
        animationView.playAnimation()
    }

    private fun showListening() {
        animationView.setMinAndMaxFrame(SOUND_MIN, SOUND_MAX)
    }

    private fun showProcessing() {
        animationView.setMinAndMaxFrame(PROCESSING_MIN, PROCESSING_MAX)
    }

    private fun animateError() {
        animationView.setMinAndMaxFrame(ERROR_MIN, ERROR_MAX)
    }

    inner class Listener : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            showReady()
        }

        override fun onBeginningOfSpeech() {
            showListening()
        }

        override fun onBufferReceived(buffer: ByteArray?) {}

        override fun onEndOfSpeech() {
            showProcessing()
        }

        override fun onResults(results: Bundle?) {
            animationView.setMinAndMaxFrame(SUCCESS_MIN, SUCCESS_MAX)
            results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.let {
                handleResults(it)
            }
        }

        override fun onError(error: Int) {
            animationView.pauseAnimation()
            val errorText = when (error) {
                SpeechRecognizer.ERROR_AUDIO -> "Audio error"
                SpeechRecognizer.ERROR_CLIENT -> "Client error"
                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
                SpeechRecognizer.ERROR_NETWORK -> "Network error"
                SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout error"
                SpeechRecognizer.ERROR_NO_MATCH -> getString(R.string.no_match)
                SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer busy error"
                SpeechRecognizer.ERROR_SERVER -> "Server error"
                SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> getString(R.string.no_speech)
                else -> "Unknown error"
            }
            textView.text = errorText
            animateError()

            // This appears to be necessary to make the next
            // attempt at listening work..
            closeRecognizer()

            if (error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT ||
                error == SpeechRecognizer.ERROR_NO_MATCH
            ) {
                Handler().postDelayed(
                    {
                        textView.text = ""
                    },
                    ERROR_DISPLAY_TIME
                )
                startSpeechRecognition()
            } else {
                Log.e(TAG, "err: $errorText")
            }
        }

        override fun onEvent(eventType: Int, params: Bundle?) {}

        override fun onPartialResults(partialResults: Bundle?) {}

        override fun onRmsChanged(rmsdB: Float) {}
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == SPEECH_RECOGNITION_REQUEST) {
            if (resultCode == RESULT_OK && data is Intent) {
                data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?. let {
                    handleResults(it)
                }
            } else {
                textView.text = getString(R.string.no_match)
            }
        }
    }

    private fun handleResults(results: List<String>) {
        results.let {
            if (it.isNotEmpty()) {
                textView.text = it[0]
                Handler().postDelayed({
                    startActivity(Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("${BASE_URL}${URLEncoder.encode(it[0], ENCODING)}")
                    ))
                }, LAUNCH_DELAY)
            } else {
                textView.text = getString(R.string.no_match)
            }
        }
    }

    override fun onPause() {
        super.onPause()
        animationView.pauseAnimation()
        closeRecognizer()
    }

    override fun onDestroy() {
        super.onDestroy()
        closeRecognizer()
    }

    companion object {
        internal var recognizer: SpeechRecognizer? = null
        internal const val TAG = "MainActivity"
        internal const val ENCODING = "UTF-8"
        internal const val SPEECH_RECOGNITION_REQUEST = 1
        internal const val PERMISSIONS_REQUEST_CODE = 1
        internal const val BASE_URL =
            "https://mozilla.github.io/firefox-voice/assets/execute.html?text="
        internal const val LAUNCH_DELAY = 500L // ms before launching browser
        internal const val ERROR_DISPLAY_TIME = 1000L

        // Animation frames
        internal const val SOLICIT_MIN = 0
        internal const val SOLICIT_MAX = 30
        internal const val SOUND_MIN = 30
        internal const val SOUND_MAX = 78
        internal const val PROCESSING_MIN = 78
        internal const val PROCESSING_MAX = 134
        internal const val ERROR_MIN = 134
        internal const val ERROR_MAX = 153
        internal const val SUCCESS_MIN = 184
        internal const val SUCCESS_MAX = 203
    }
}
