// ga-main.js
console.log("no waaaay");
const path = require('path');
const GoogleAssistant = require('google-assistant');
const config = {
  auth: {
    keyFilePath: path.resolve(__dirname, '/credentials/client_secret.json'),
    // where you want the tokens to be saved
    // will create the directory if not already there
    savedTokensPath: path.resolve(__dirname, '/credentials/tokens.json'),
  },
  conversation: {
    lang: 'en-US', // language code for input/output (defaults to en-US)
    isNew: true, // set this to true if you want to force a new conversation and ignore the old state
    screen: {
      isOn: true, // set this to true if you want to output results to a screen
    },
  },
};

// const assistant = new GoogleAssistant(config.auth);

// // starts a new conversation with the assistant
// const startConversation = (conversation) => {
//   // setup the conversation and send data to it
//   // for a full example, see `examples/mic-speaker.js`

//   conversation
//     .on('audio-data', (data) => {
//       // do stuff with the audio data from the server
//       // usually send it to some audio output / file
//     })
//     .on('end-of-utterance', () => {
//       // do stuff when done speaking to the assistant
//       // usually just stop your audio input
//     })
//     .on('transcription', (data) => {
//       // do stuff with the words you are saying to the assistant
//     })
//     .on('response', (text) => {
//         console.info("Here is what Google says!");
//         console.info(text);
//     })
//     .on('volume-percent', (percent) => {
//       // do stuff with a volume percent change (range from 1-100)
//     })
//     .on('device-action', (action) => {
//       // if you've set this device up to handle actions, you'll get that here
//     })
//     .on('screen-data', (screen) => {
//       // if the screen.isOn flag was set to true, you'll get the format and data of the output
//     })
//     .on('ended', (error, continueConversation) => {
//       // once the conversation is ended, see if we need to follow up
//       if (error) console.log('Conversation Ended Error:', error);
//       else if (continueConversation) assistant.start();
//       else console.log('Conversation Complete');
//     })
//     .on('error', error => console.error(error));
// };

// // will start a conversation and wait for audio data
// // as soon as it's ready
// assistant
//     .on('ready', () => console.info("The Google Assistant is ready!"))
//     .on('error', (error) => {
//         console.log('Assistant Error:', error);
//     });

//     // assistant.start(config.conversation)