/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
import android.text.SpannableStringBuilder
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.text.bold
import androidx.core.text.italic
import androidx.core.text.scale
import com.airbnb.lottie.LottieDrawable
import java.net.URLEncoder
import kotlinx.android.synthetic.main.activity_main.*
import mozilla.voice.assistant.intents.IntentRunner
import mozilla.voice.assistant.intents.Metadata
import mozilla.voice.assistant.language.Compiler
import mozilla.voice.assistant.language.Language

class MainActivity : AppCompatActivity() {
    private var suggestionIndex = 0
    private lateinit var suggestions: List<String>
    private lateinit var intentRunner: IntentRunner

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        suggestions = resources.getStringArray(R.array.sample_phrases).toList<String>()

        val language = Language(this)
        val metadata = Metadata(this)
        val compiler = Compiler(metadata, language)
        intentRunner = IntentRunner(compiler)
    }

    override fun onStart() {
        super.onStart()
        feedbackView.text = ""
        statusView.text = getString(R.string.initializing)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissions(
                arrayOf(
                    Manifest.permission.SET_ALARM,
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

    private var shownBurst = false

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSIONS_REQUEST_CODE) {
            if (grantResults.toList().all { it == PackageManager.PERMISSION_GRANTED }) {
                shownBurst = false
                startSpeechRecognition()
            } else {
                Toast.makeText(
                    this,
                    "Permissions denied",
                    Toast.LENGTH_LONG
                ).show()
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
        if (shownBurst) {
            animationView.setMinAndMaxFrame(SOUND_MIN, SOUND_MAX)
        } else {
            animationView.setMinAndMaxFrame(SOLICIT_MIN, SOUND_MAX)
            shownBurst = true
            animationView.repeatCount = 1
            animationView.addAnimatorUpdateListener { valueAnimator ->
                if (valueAnimator.animatedFraction > .99) { // close enough to 1
                    animationView.setMinFrame(SOUND_MIN)
                    animationView.removeAllUpdateListeners()
                    animationView.repeatCount = LottieDrawable.INFINITE
                }
            }
        }
        animationView.playAnimation()
        statusView.text = getString(R.string.listening)
    }

    private fun showListening() {
        animationView.pauseAnimation()
        animationView.setMinAndMaxFrame(SOUND_MIN, SOUND_MAX)
        animationView.resumeAnimation()
        animationView.removeAllUpdateListeners()
        animationView.repeatCount = LottieDrawable.INFINITE
        statusView.text = getString(R.string.listening)
    }

    private fun showProcessing() {
        animationView.setMinAndMaxFrame(PROCESSING_MIN, PROCESSING_MAX)
        statusView.text = getString(R.string.processing)
    }

    private fun showSuccess() {
        animationView.setMinAndMaxFrame(SUCCESS_MIN, SUCCESS_MAX)
        animationView.repeatCount = 0
        statusView.text = getString(R.string.got_it)
    }

    private fun displayError(errorText: String) {
        animationView.setMinAndMaxFrame(ERROR_MIN, ERROR_MAX)
        statusView.text = ""
        feedbackView.text = errorText
    }

    private fun giveSuggestions() {
        if (suggestionIndex + NUM_SUGGESTIONS > suggestions.size) {
            suggestionIndex = 0
        }

        val ideas = suggestions.subList(suggestionIndex, suggestionIndex + NUM_SUGGESTIONS)
            .joinToString("\n\n")

        feedbackView.text = SpannableStringBuilder()
            .scale(.6f) {
                italic { append(getString(R.string.suggestion_prefix)) }
                    .append("\n\n")
                    .bold { append(ideas) }
            }

        suggestionIndex += NUM_SUGGESTIONS
    }

    inner class Listener : RecognitionListener {
        private var speechDetected = false

        override fun onReadyForSpeech(params: Bundle?) {
            speechDetected = false
            showReady()
            Handler().postDelayed({
                if (!speechDetected) {
                    giveSuggestions()
                }
            }, ADVICE_DELAY)
        }

        override fun onBeginningOfSpeech() {
            speechDetected = true
            showListening()
        }

        override fun onBufferReceived(buffer: ByteArray?) {}

        override fun onEndOfSpeech() {
            speechDetected = true // just in case onBeginningOfSpeech() wasn't called
            showProcessing()
        }

        override fun onResults(results: Bundle?) {
            showSuccess()
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

            // This appears to be necessary to make the next
            // attempt at listening work.
            closeRecognizer()

            if (error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT ||
                error == SpeechRecognizer.ERROR_NO_MATCH
            ) {
                startSpeechRecognition()
            } else {
                displayError(errorText)
                Log.e(TAG, "err: $errorText")
            }
        }

        override fun onEvent(eventType: Int, params: Bundle?) {}

        override fun onPartialResults(partialResults: Bundle?) {}

        override fun onRmsChanged(rmsdB: Float) {}
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        statusView.text = ""
        if (requestCode == SPEECH_RECOGNITION_REQUEST) {
            if (resultCode == RESULT_OK && data is Intent) {
                data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.let {
                    handleResults(it)
                }
            } else {
                feedbackView.text = getString(R.string.no_match)
            }
        }
    }

    private fun getIntent(utterance: String): Intent =
        intentRunner.runUtterance(utterance, this)?.let { intent ->
            intent.resolveActivityInfo(packageManager, intent.flags)?.let { activityInfo ->
                if (activityInfo.exported) intent else null
            }
        } ?: Intent(
            Intent.ACTION_VIEW,
            Uri.parse("${BASE_URL}${URLEncoder.encode(utterance, ENCODING)}")
        )

    private fun handleResults(results: List<String>) {
        results.let {
            if (it.isNotEmpty()) {
                feedbackView.text = it[0]
                val intent = getIntent(it[0])
                Handler().postDelayed(
                    { startActivity(intent) },
                    TRANSCRIPT_DISPLAY_TIME
                )
            } else {
                feedbackView.text = getString(R.string.no_match)
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
        internal const val TRANSCRIPT_DISPLAY_TIME = 1000L // ms before launching browser
        internal const val ADVICE_DELAY = 1250L // ms before suggesting utterances
        internal const val NUM_SUGGESTIONS = 3 // number of suggestions to show at a time

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
        internal const val SUCCESS_MAX = 205
    }
}
