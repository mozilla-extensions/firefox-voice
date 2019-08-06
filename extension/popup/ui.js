this.ui = (function () {
	const exports = {};

	let animation;
	let currentState = "loading";

	const playAnimation = function playAnimation(animationName, loop) {
		console.log("am i back here");
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
		animation = playAnimation('processing', true);
		getMicVolume(stream, animation);
	}

	const getMicVolume = function getMicVolume(stream, animation) {
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
		javascriptNode.onaudioprocess = function() {
			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			let values = 0;

			const length = array.length;
			for (let i = 0; i < length; i++) {
				values += (array[i]);
			}

			const average = values / length;

			console.log(Math.round(average));
			console.log(`UPDATE POLL IS ${updatePoll}`);
			if (updatePoll > 5) {
				updatePoll = 0;
				setAnimationForVolume(average, animation);
			} else {
				updatePoll++;
			}
		}
	}

	const setAnimationForVolume = function setAnimationForVolume(avgVolume, animation) {
		console.log("updating");
		animation.onLoopComplete = function(){ // code here
			animation.stop();
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
	}

	const STATES = {}

	STATES.loading = {
		header: "Warming up...",
		bodyClass: "loading"
	}

	STATES.listening = {
		header: "Listening",
		bodyClass: "listening"
	}

	STATES.processing = {
		header: "One second...",
		bodyClass: "processing"
	}


	exports.setState = function setState(newState) {
		document.querySelector("#header-title").textContent = STATES[newState].header;
		document.body.classList.remove(STATES[currentState].bodyClass);
		document.body.classList.add(STATES[newState].bodyClass);
	}

	exports.playListeningChime = function playListeningChime() {
		var audio = new Audio("https://jcambre.github.io/vf/mic_open_chime.ogg"); // TODO: File bug on local audio file playback
		audio.play();
	}


	return exports;
})();