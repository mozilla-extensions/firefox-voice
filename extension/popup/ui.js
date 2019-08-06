this.ui = (function () {
	const exports = {};

	exports.playAnimation = function playAnimation(animationName, loop) {
		const container = document.getElementById("zap");
		window.lottie.loadAnimation({
			container, // the dom element that will contain the animation
			loop,
			renderer: 'svg',
			autoplay: true,
			path: `animations/${animationName}.json` // the path to the animation json
		});
	};

	return exports;
})();