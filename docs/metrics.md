# Firefox Voice Metrics

This document is a summary of the metrics Firefox Voice records, how we're recording them, and what we're looking for with these metrics.

The general purpose of our data collection is:

1. To understand what portions of Firefox Voice are valuable to users
2. To see indications of functionality that people want to use in Firefox Voice, even if the tool lacks that functionality
3. To detect cases where users might be confused or unable to understand the tool
4. To detect flaws in the tool: bugs, update problems, server problems, etc.
5. Some basic segmentation information so we can associate the above learnings with release groups, how long a user has used the tool, etc.

## Data Storage

All data is kept in the Mozilla/Firefox [Telemetry system](https://wiki.mozilla.org/Telemetry). This is the same system that stores general Telemetry data. Note audio is handled differently (see "Audio collection").

If you opt-out of Telemetry in Firefox, you will also implicitly opt-out of Telemetry in Firefox Voice, regardless of any settings in Firefox Voice.

## Parameters

This is a list of what we actually store. This data is sent on every interaction with Firefox Voice (when you open the popup and speak a command).

### Basic interaction data

- **intentId**: random ID assigned to each interaction
- **timestamp**: when hit the button or started the tool
- **localHour**: the local hour of the day (e.g., 8am local time, regardless of UTC)
- **extensionTemporaryInstall**: this is typically true only if you are developing the tool locally
- **extensionVersion**: the version number of the Firefox Voice extension
- **numberOfOpenTabs**: the number of open tabs. We are collecting this to understand if tab management (especially when a user uses lots of tabs to manage their work) is an important area

### Recording data

- **audioTime**: the length of the recording
- **inputCancelled**: was the entire interaction cancelled?
- **inputLength**: characters in the transcription. We keep this even if the exact text spoken isn't kept
- **inputTyped**: was this typed instead of spoken?

### User information

- **country**: country code of the user. We want to use this to understand our specific service integrations (where people in different countries often use different services), and how possible accents might affect understanding or syntax
- **extensionInstallationChannel**: this is the first version the user used, to give us a sense of when they started or how they found the tool
- **extensionInstallDate**: when the extension was first installed

### Transcription information

- **serverErrorSpeech**: the text of the error, if the server returned some error message
- **serverTimeSpeech**: how long the server took to respond to the request
- **serverVersion**: the server version (though currently unreported)
- **utteranceChars**: how many characters in the utterance (an attempt to see how long the utterance was, even if we don't store the exact utterance)
- **transcriptionConfidence**: a confidence of the transcription 0.0-1.0
- **deepSpeechConfidence**: the confidence as reported by DeepSpeech
- **deepSpeechMatches**: if the DeepSpeech transcription matches our other service. This is saved even if the specific utterances aren't saved. We use this to understand the accuracy of our DeepSpeech service.
- **deepSpeechServerTime**: how long that server took to respond

#### Utterances

These values store the actual command given to Firefox Voice. This data is only stored if the user has opted-in to this storage specifically (and is separate from the audio opt-in).

- **utterance**: the actual transcribed text of the command
- **utteranceDeepSpeech**: a parallel transcription we make with DeepSpeech to test its performance
- **utteranceParsed**: this contains an indication of how we parsed the utterance. The **intent** is the command, which often takes slots (i.e., parameters). This contains those. E.g., "find calendar tab" would be parsed with `{slots: {query: "calendar"}}`

### Command parsing/result information

- **intent**: the ID of the intent handler; this gives us a general idea of how the intent was handled, distinguishing, for example, search, closing a tab, playing music, etc.
- **intentCategory**: the first part of the intent ID
- **intentFallback**: was the intent a "fallback"? That is, no specific intent matched the command, so it was treated as a generic search
- **hasCard**: did this command lead to a card being displayed in the popup?
- **intentServiceName**: though not currently used, this would hold information about a specific service associated with the intent, from a whitelist of supported servics (e.g., Spotify vs Amazon Music)
- **intentSuccess**: did the intent succeed? An example where it wouldn't: you try to get the next result for a search, but you've made no search
- **intentTime**: performance measurement, about how long it takes to parse and start the intent command
- **internalError**: some unexpected error associated with the attempt to execute the intent (**intentSuccess** handles expected errors)

### Standard Firefox parameters

We store a set of common fields that describe the Firefox build, your CPU type, etc. Everything besides `"payload"` in [voiceSchema.js](../extension/background/voiceSchema.js) is one of these "standard" parameters.

## Removing Your Data

Audio collection is kept indefinitely, and we do not have metadata associated with the audio to allow us to associate you to any audio file. As a result we also cannot remove it.

Other Telemetry data is retained and deleted in accordance with other Firefox/Mozilla Telemetry data.

## Audio collection

If you turn on the preference in settings to allow us to collect audio, then your audio will be stored in our systems for later use in training our machine learning speech-to-text systems.

This audio is only collected if you specifically opt-in to audio collection. It is not classified alongside other data.

## Related code

The Telemetry is submitted in [`telemetry.js`](../extension/background/telemetry.js)

The schema is kept in [`voiceSchema.js`](../extension/background/voiceSchema.js)
