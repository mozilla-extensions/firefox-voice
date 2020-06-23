/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package mozilla.voice.assistant

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.text.SpannableStringBuilder
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.text.bold
import androidx.core.text.italic
import androidx.core.text.scale
import com.airbnb.lottie.LottieDrawable
import java.util.Timer
import kotlin.concurrent.schedule
import kotlinx.android.synthetic.main.activity_main.*
import mozilla.voice.assistant.intents.IntentRunner
import mozilla.voice.assistant.intents.Metadata
import mozilla.voice.assistant.intents.alarm.Alarm
import mozilla.voice.assistant.intents.apps.Install
import mozilla.voice.assistant.intents.apps.Launch
import mozilla.voice.assistant.intents.communication.PhoneCall
import mozilla.voice.assistant.intents.communication.TextMessage
import mozilla.voice.assistant.intents.maps.Maps
import mozilla.voice.assistant.intents.music.Music
import mozilla.voice.assistant.language.Compiler
import mozilla.voice.assistant.language.Language

/**
 * Launches a voice search and takes action based on the user's utterance. Specifically,
 * it passes transcriptions of the utterance to [IntentRunner.determineBestIntent], which
 * returns an [Intent] satisfying the user's request, which is launched.
 *
 * This activity can be started in a few ways (from most to least common):
 * 1. When the program is launched.
 * 2. Through the back button or task switcher.
 * 3. When a user utterance could not be handled directly.
 *
 * An example of case 3 is when the user utters "Launch Spotify" but Spotify is not installed.
 * In this case, [Launch] creates a [MainActivity] intent using [MainActivity.createIntent],
 * setting the extra [STATUS_KEY] to "Spotify is not installed" and setting the extra
 * [SUGGESTION_KEY] to "Search for Spotify in the Google Play Store".
 *
 * If these extras are set, [MainActivity] displays the status message and makes the suggestion
 * in text and on a button. If the extra are not set (cases 1 and 2), suggestions are taken from
 * [mozilla.voice.assistant.intents.Intent] examples, and the button is not shown.
 */
@SuppressWarnings("TooManyFunctions")
class MainActivity : AppCompatActivity() {
    private var chimeVolume: Int = 0
    private lateinit var intentRunner: IntentRunner
    private var intentStatus: String? = null
    private var intentSuggestion: String? = null

    // showReady() uses shownBurst to ensure the initial "burst" animation is shown only once
    private var shownBurst = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        initializeData()
    }

    private fun initializeData() {
        val language = Language(this)
        val metadata = Metadata(this, language)
        val compiler = Compiler(metadata, language)
        intentRunner = IntentRunner(
            compiler,
            Alarm.getIntents() +
                    Install.getIntents() +
                    Launch.getIntents() +
                    Maps.getIntents() +
                    Music.getIntents() +
                    PhoneCall.getIntents() +
                    TextMessage.getIntents()
        )
        intentStatus = intent.getStringExtra(STATUS_KEY)
        intentSuggestion = intent.getStringExtra(SUGGESTION_KEY)
    }

    override fun onStart() {
        super.onStart()
        updateViews()
        initializeChimeVolume()
        checkPermsBeforeStartingSpeechRecognition()
    }

    private fun setStatusText(s: String) {
        statusView.text = s
    }

    private fun updateViews() {
        feedbackView.text = ""
        setStatusText(intentStatus ?: getString(R.string.initializing))
        intentSuggestion?.let { suggestion ->
            suggestionButton.text = suggestion
            suggestionButton.visibility = View.VISIBLE
                suggestionButton.setOnClickListener { _ ->
                    run {
                        closeRecognizer()
                        handleResults(listOf(suggestion))
                    }
                }
        } ?: run {
            suggestionButton.visibility = View.INVISIBLE
            suggestionButton.setOnClickListener(null)
        }
    }

    private fun initializeChimeVolume() {
        if (chimeVolume == 0) {
            val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            val volume = audioManager.getStreamVolume(CHIME_STREAM)
            chimeVolume = if (volume == 0) {
                audioManager.getStreamMaxVolume(CHIME_STREAM) / 2
            } else {
                volume
            }
        }
    }

    private fun checkPermsBeforeStartingSpeechRecognition() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            setStatusText(getString(R.string.no_voice_input))
            return
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissions(
                arrayOf(
                    Manifest.permission.SET_ALARM,
                    Manifest.permission.RECORD_AUDIO
                ),
                PERMISSIONS_REQUEST_CODE
            )
        } else {
            startSpeechRecognition()
        }
    }

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

    private fun setChimeStreamVolume(level: Int) {
        (getSystemService(Context.AUDIO_SERVICE) as AudioManager).apply {
            setStreamVolume(
                CHIME_STREAM,
                level,
                0
            )
        }
    }

    private fun muteChimeStream() {
        setChimeStreamVolume(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)
                (getSystemService(Context.AUDIO_SERVICE) as AudioManager).getStreamMinVolume(
                    CHIME_STREAM
                )
            else {
                0
            }
        )
    }

    private fun unmuteChimeStream() {
        setChimeStreamVolume(chimeVolume)
    }

    override fun onStop() {
        super.onStop()
        unmuteChimeStream()
    }

    private fun startSpeechRecognition() {
        unmuteChimeStream()
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
                @SuppressWarnings("MagicNumber")
                if (valueAnimator.animatedFraction > .99) { // close enough to 1
                    animationView.setMinFrame(SOUND_MIN)
                    animationView.removeAllUpdateListeners()
                    animationView.repeatCount = LottieDrawable.INFINITE
                }
            }
        }
        animationView.playAnimation()
        setStatusText(intentStatus ?: getString(R.string.listening))
    }

    private fun showListening() {
        animationView.pauseAnimation()
        animationView.setMinAndMaxFrame(SOUND_MIN, SOUND_MAX)
        animationView.resumeAnimation()
        animationView.removeAllUpdateListeners()
        animationView.repeatCount = LottieDrawable.INFINITE
        setStatusText(getString(R.string.listening))
    }

    private fun showProcessing() {
        animationView.setMinAndMaxFrame(PROCESSING_MIN, PROCESSING_MAX)
        setStatusText(getString(R.string.processing))
    }

    private fun showSuccess() {
        animationView.setMinAndMaxFrame(SUCCESS_MIN, SUCCESS_MAX)
        animationView.repeatCount = 0
        setStatusText(getString(R.string.got_it))
    }

    private fun displayError(errorText: String) {
        animationView.setMinAndMaxFrame(ERROR_MIN, ERROR_MAX)
        setStatusText(errorText)
        feedbackView.text = errorText
    }

    private fun getSuggestionPrefix() =
        getString(
            if (intentSuggestion != null) {
                R.string.specific_suggestion_prefix
            } else {
                R.string.general_suggestion_prefix
            }
        )

    private fun getSuggestions() =
        intentSuggestion ?: intentRunner.getExamplePhrases(MAX_SUGGESTIONS)
            .joinToString(
                separator = "\n\n"
            )

    private fun giveSuggestions() {
        feedbackView.text =
            SpannableStringBuilder()
                .scale(SUGGESTIONS_SCALE) {
                    italic { append(getSuggestionPrefix()) }
                        .append("\n\n")
                        .bold { append(getSuggestions()) }
                }
    }

    private fun closeRecognizer() {
        recognizer?.stopListening()
        recognizer?.destroy()
        recognizer = null
    }

    @SuppressWarnings("EmptyFunctionBlock")
    inner class Listener : RecognitionListener {
        private var speechDetected = false

        override fun onReadyForSpeech(params: Bundle?) {
            speechDetected = false
            showReady()
            Handler(Looper.getMainLooper()).postDelayed({
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
            closeRecognizer()
            Timer("mute", false).schedule(CHIME_MUTE_DELAY) {
                muteChimeStream()
            }
            showSuccess()
            results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.let {
                handleResults(it)
            }
        }

        @SuppressWarnings("ComplexMethod")
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

            // This appears to be necessary to make the next attempt at listening work.
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
        if (requestCode == SPEECH_RECOGNITION_REQUEST) {
            setStatusText(getString(R.string.processing))
            if (resultCode == RESULT_OK && data is Intent) {
                data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.let {
                    handleResults(it)
                }
            } else {
                feedbackView.text = getString(R.string.no_match)
            }
        }
    }

    private fun handleResults(results: List<String>) {
        results.let {
            if (it.isNotEmpty()) {
                intentRunner.determineBestIntent(this, results).let {
                    // Clear out any suggestions extracted from extras, in case this activity is
                    // returned to using the back button or recents.
                    intentStatus = null
                    intentSuggestion = null
                    // Pause briefly before launching the intent to show the winning transcription.
                    feedbackView.text = it.first
                    Handler(Looper.getMainLooper()).postDelayed(
                        { startActivity(it.second) },
                        TRANSCRIPT_DISPLAY_TIME
                    )
                }
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
        private const val TAG = "MainActivity"
        private const val SPEECH_RECOGNITION_REQUEST = 1
        private const val PERMISSIONS_REQUEST_CODE = 1
        private const val TRANSCRIPT_DISPLAY_TIME = 1000L // ms before launching browser
        private const val ADVICE_DELAY = 1250L // ms before suggesting utterances
        private const val MAX_SUGGESTIONS = 3 // max. number of suggestions to show at a time
        private const val SUGGESTIONS_SCALE = .6f
        private const val STATUS_KEY = "status"
        private const val SUGGESTION_KEY = "message"

        // Hack to prevent hearing SpeechRecognizer chime after recognizer is closed.
        private const val CHIME_STREAM = AudioManager.STREAM_MUSIC
        private const val CHIME_MUTE_DELAY = 1000L

        // Animation frames
        private const val SOLICIT_MIN = 0
        private const val SOLICIT_MAX = 30
        private const val SOUND_MIN = 30
        private const val SOUND_MAX = 78
        private const val PROCESSING_MIN = 78
        private const val PROCESSING_MAX = 134
        private const val ERROR_MIN = 134
        private const val ERROR_MAX = 153
        private const val SUCCESS_MIN = 184
        private const val SUCCESS_MAX = 205

        private var recognizer: SpeechRecognizer? = null

        fun createIntent(context: Context, feedback: String, suggestion: String) =
            Intent(context, MainActivity::class.java).run {
                putExtra(STATUS_KEY, feedback)
                putExtra(SUGGESTION_KEY, suggestion)
            }
    }
}
