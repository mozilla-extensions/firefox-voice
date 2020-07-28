class SpeechResModel {

	constructor(modelName, commands) {
		this.modelName = modelName;
		this.commands = commands;
		this.config = modelConfig[modelName];

		this.config['n_labels'] = this.commands.length;

		console.log('model name : ', this.modelName);

		// layer definition
		let layers = {};

		layers['conv0'] = tf.layers.conv2d({
			filters: this.config['n_feature_maps'],
			kernelSize: this.config['conv_size'],
			strides: this.config['conv_stride'],
			padding: "same",
			useBias: false,
			activation: 'relu',
			kernelInitializer: 'glorotUniform',
			biasInitializer: tf.initializers.zeros(),
			name: "conv0",
		})

		if (this.config['res_pool']) {
			layers['pool'] = tf.layers.averagePooling2d({
				poolSize: this.config['res_pool'],
				name: "pool",
			})
		}

		if (this.config['use_dilation']) {
			for (var i  = 0; i < (this.config['n_layers']); i++) {
				layers['conv'+ (i+1)] = tf.layers.conv2d({
					filters: this.config['n_feature_maps'],
					kernelSize: this.config['conv_size'],
					padding: "same",
					dilation: Math.pow(2, Math.floor(i/3)),
					useBias: false,
					activation: 'relu',
					kernelInitializer: 'glorotUniform',
					biasInitializer: tf.initializers.zeros(),
					name: "conv"+(i+1),
				})
			}
		} else {
			for (var i  = 0; i < (this.config['n_layers']); i++) {
				let numFilters = this.config['n_feature_maps'];
				if (this.config['n_kept_feature'] && (i % 2 == 0)) {
					numFilters = this.config['n_kept_feature'];
				}
				layers['conv'+ (i+1)] = tf.layers.conv2d({
					filters: numFilters,
					kernelSize: this.config['conv_size'],
					padding: "same",
					dilation: 1,
					useBias: false,
					activation: 'relu',
					kernelInitializer: 'glorotUniform',
					biasInitializer: tf.initializers.zeros(),
					name: "conv"+(i+1),
				})
			}
		}

		for (var i  = 0; i < (this.config['n_layers']); i++) {
			layers['bn'+ (i+1)] = tf.layers.batchNormalization({
				epsilon: 0.00001,
				momentum: 0.1,
				gammaInitializer: tf.initializers.ones(),
				betaInitializer: tf.initializers.zeros(),
				name: "bn"+(i+1),
			})
		}

		layers['output'] = tf.layers.dense({
			units: this.config['n_labels'],
			activation: 'linear',
			biasInitializer : tf.initializers.zeros(),
			name: "output",
		});

		for (var i  = 2; i < (this.config['n_layers'] + 1); i++) {
			if (i % 2 == 0) {
				layers['add'+i] = tf.layers.add({name: "add" + i});
			}
		}

		layers['globalAvgPool'] = tf.layers.globalAveragePooling2d({});
		layers['softmax'] = tf.layers.softmax();

		// compile model

		const input = tf.input({shape: this.config['input_shape']});
		let x = input;

		let y, old_x;

		for (var i  = 0; i < (this.config['n_layers'] + 1); i++) {
			y = layers['conv'+ i].apply(x);

			if (i == 0) {
				if (layers['pool']) {
					y = layers['pool'].apply(y);
				}
				old_x = y;
			}

			if ((i > 0) && (i % 2 == 0)) {
				x = layers['add'+ i].apply([y, old_x]);
				old_x = x;
			} else {
				x = y;
			}

			if (i > 0) {
				x = layers['bn'+ i].apply(x)
			}
		}

		x = layers['globalAvgPool'].apply(x);
		x = layers['output'].apply(x);

		const softmax = layers['softmax'].apply(x);

		this.model = tf.model({
			inputs: input,
			outputs: softmax,
		});

		this.model.summary();

		// weights loading
		let weightName = this.config['weight_name'];
		this.loadWeight(layers, weights[weightName]);
	}

    // load pretrained weights from json file
	loadWeight(layers, weights, pytorch=true) {
		// preprocee weights before assignment
		let processedWeights = {};
		let weightNames = Object.keys(weights);
		for (var index in weightNames) {
			let weightName = weightNames[index];
			let nameSplit = weightName.split(".");
			let layer = nameSplit[0];

			if (!(layer in processedWeights)) {
				processedWeights[layer] = {};
			}
			processedWeights[layer][nameSplit[1]] = weights[weightName];
		}

		function reformatConvKernel(weight) {
			let reformat = [];
			for (var colsIndex = 0; colsIndex < weight[0][0][0].length; colsIndex++) {
				reformat.push([]);
				for (var rowsIndex = 0; rowsIndex < weight[0][0].length; rowsIndex++) {
					reformat[colsIndex].push([]);
					for (var inFilterIndex = 0; inFilterIndex < weight[0].length; inFilterIndex++) {
						reformat[colsIndex][rowsIndex].push([]);
					}
				}
			}

			for (var outFilterIndex = 0; outFilterIndex < weight.length; outFilterIndex++) {
				for (var inFilterIndex = 0; inFilterIndex < weight[0].length; inFilterIndex++) {
					for (var rowsIndex = 0; rowsIndex < weight[0][0].length; rowsIndex++) {
						for (var colsIndex = 0; colsIndex < weight[0][0][0].length; colsIndex++) {
							reformat[colsIndex][rowsIndex][inFilterIndex].push(weight[outFilterIndex][inFilterIndex][rowsIndex][colsIndex]);
						}
					}
				}
			}
			return reformat;
		}

		for (var key in layers) {
			let w = [];
			if (key.includes("conv")) {
				// weight index 0 = kernel
				let convKernelShape = layers[key].getWeights()[0].shape;
				let convKernel = processedWeights[key]['weight'];

				if (pytorch) {
					convKernel = reformatConvKernel(processedWeights[key]['weight']);
				}
				w.push(tf.tensor4d(convKernel, convKernelShape, 'float32'));
			}
			if (key.includes("bn")) {

				// set gamma to scaled weights for odd layers
				let bnGammaShape = layers[key].getWeights()[0].shape;
				let index = parseInt(key.substring(2));
				let scaleWeightKey = "scale" + index;

				if (processedWeights[scaleWeightKey]) {
					w.push(tf.tensor1d(processedWeights[scaleWeightKey]['scale'], 'float32'));
				} else {
					w.push(tf.tensor1d(new Array(bnGammaShape[0]).fill(1), 'float32'));
				}

				// weight index 1 = beta - 0 (due to Affine = false)
				let bnBetaShape = layers[key].getWeights()[1].shape;
				w.push(tf.tensor1d(new Array(bnBetaShape[0]).fill(0), 'float32'));

				// weight indes 2 = moving_mean
				w.push(tf.tensor1d(processedWeights[key]['running_mean'], 'float32'));

				// weight index 3 = moving_variance
				w.push(tf.tensor1d(processedWeights[key]['running_var'], 'float32'));
			}
			if (key.includes("output")) {
				// weight index 0 = kernel
				let denseKernelShape = layers[key].getWeights()[0].shape;
				let denseKernel = processedWeights[key]['weight'];

				if (pytorch) {
					denseKernel = transpose2d(processedWeights[key]['weight']);
				}

				w.push(tf.tensor2d(denseKernel, denseKernelShape, 'float32'));

				// weight index 1 = bias
				w.push(tf.tensor1d(processedWeights[key]['bias'], 'float32'));
			}
			layers[key].setWeights(w);
		}
	}

	predict(x) {
		if (!(x instanceof tf.Tensor)) {
			x = tf.tensor(x);
		}
		let input_shape = this.config['input_shape'].slice();
		input_shape.unshift(-1);

		let output = this.model.predict(x.reshape(input_shape));
		return output.dataSync();
	}
}
