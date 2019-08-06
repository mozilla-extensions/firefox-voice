this.ui = (function () {
	const exports = {};

	let animation;
	let currentState = "listening";
	let textInputDetected = false;

	function playAnimation(animationName, loop) {
		const container = document.getElementById("zap");
		const anim = lottie.loadAnimation({
			container, // the dom element that will contain the animation
			loop,
			renderer: 'svg',
			autoplay: true,
			path: `animations/${animationName}.json` // the path to the animation json
		});
		return anim;
	};

	exports.animateByMicVolume = function animateByMicVolume(stream) {
		animation = playAnimation('Firefox_Voice_Full', true);
		getMicVolume(stream, animation);
	};

	function getMicVolume(stream, animation) {
		// Inspired by code from https://stackoverflow.com/a/52952907
		audioContext = new AudioContext();
		analyser = audioContext.createAnalyser();
		microphone = audioContext.createMediaStreamSource(stream);
		javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

		analyser.smoothingTimeConstant = 0.8;
		analyser.fftSize = 1024;

		microphone.connect(analyser);
		analyser.connect(javascriptNode);
		javascriptNode.connect(audioContext.destination);
		let updatePoll = 0;
		// TODO figure out how to stop this update process once we've disabled getUserMedia
		javascriptNode.onaudioprocess = function () {
			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			let values = 0;

			const length = array.length;
			for (let i = 0; i < length; i++) {
				values += (array[i]);
			}

			const average = values / length;

			if (updatePoll > 5) {
				updatePoll = 0;
				setAnimationForVolume(average, animation);
			} else {
				updatePoll++;
			}
		}
	};

	function setAnimationForVolume(avgVolume, animation) {
		console.log("updating");
		animation.onLoopComplete = function () { // code here
			animation.stop();
			// TODO: Adjust animations using playSegment when we receive the combined file
			// if (avgVolume < 10) {
			// 	animation = playAnimation('base', true);
			// } else if (avgVolume < 20) {
			// 	animation = playAnimation('low', true);
			// } else if (avgVolume < 30) {
			// 	animation = playAnimation('medium', true);
			// } else {
			// 	animation = playAnimation('high', true);
			// }
		}
	};

	// Event handler for when we detect the user has started typing
	function detectText(e) {
		if (!textInputDetected) {
			exports.setState('typing'); // TODO: is this the right place to set the state? or should that all be handled by popup.js
			textInputDetected = true;
			// TODO: SEND MESSAGE TO STOP MIC INPUT
		}
		if (e.keyCode === 13) {
			processTextQuery();
		}
	}

	// Event handler for processing a text query
	function processTextQuery(e) {
		// TODO: Finish
	}

	exports.listenForText = function listenForText() {
		const textInput = document.getElementById("text-input-field");
		textInput.focus();
		textInput.addEventListener("keyup", detectText);

		const sendText = document.getElementById("send-text-input");
		sendText.addEventListener("click", processTextQuery);
	}

	const STATES = {};

	// STATES.loading = {
	// 	header: "Warming up...",
	// 	bodyClass: "loading"
	// };

	STATES.listening = {
		header: "Listening",
		bodyClass: "listening"
	};

	STATES.processing = {
		header: "One second...",
		bodyClass: "processing"
	};

	STATES.typing = {
		header: "Type your request",
		bodyClass: "typing"
	};

	STATES.settings = {
		header: "Settings",
		bodyClass: "settings"
	}

	exports.setState = function setState(newState) {
		document.querySelector("#header-title").textContent = STATES[newState].header;
		document.querySelector("#popup").classList.remove(STATES[currentState].bodyClass);
		document.querySelector("#popup").classList.add(STATES[newState].bodyClass);
		currentState = newState;
	};

	exports.playListeningChime = function playListeningChime() {
		var audio = new Audio("https://jcambre.github.io/vf/mic_open_chime.ogg"); // TODO: File bug on local audio file playback
		audio.play();
	};

	function showPreviousState() {
		// TODO: May need to make this a bit more sophisticated and save the previous state (e.g. if they were typing)
		exports.setState('listening');
	}

	function listenForBack() {
		const backIcon = document.getElementById("back-icon");
		backIcon.addEventListener("click", showPreviousState);
	}
	
	function showSettings() {
		exports.setState('settings');
	}

	function listenForSettings() {
		const settingsIcon = document.getElementById("settings-icon");
		settingsIcon.addEventListener("click", showSettings);
	}

	function closePopup() {
		// TODO: offload mic and other resources before closing?
		window.close();
	}

	function listenForClose() {
		const closeIcon = document.getElementById("close-icon");
		closeIcon.addEventListener("click", closePopup);
	}
	
	listenForClose();
	listenForSettings();
	listenForBack();

	return exports;
})();