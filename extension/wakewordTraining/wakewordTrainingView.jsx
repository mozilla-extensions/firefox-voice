/* eslint-disable no-unused-vars */
/* globals React, speechCommands, log */

const { useState } = React;

export const WakewordTraining = ({
  savedModels,
  onTrainExample,
  heyFirefoxExamples,
  nextSlidePleaseExamples,
  backgroundNoiseExamples,
  onDeleteExample,
  onStartTraining,
}) => {
  const CLASSES_TO_TRAIN = [
    {
      name: "heyFirefox",
      readableName: "Hey Firefox",
      examples: heyFirefoxExamples,
    },
    {
      name: "nextSlidePlease",
      readableName: "Next slide please",
      examples: nextSlidePleaseExamples,
    },
    {
      name: "_background_noise_",
      readableName: "Background noise",
      examples: backgroundNoiseExamples,
    },
  ];
  return (
    <div id="wakeword-training-wrapper">
      <React.Fragment>
        <Header />
        <SelectModel savedModels={savedModels} />
        <Trainer
          classesToTrain={CLASSES_TO_TRAIN}
          onTrainExample={onTrainExample}
          onDeleteExample={onDeleteExample}
          onStartTraining={onStartTraining}
        />
        <Tester />
      </React.Fragment>
    </div>
  );
};

const Header = () => {
  return (
    <div className="settings-content">
      <fieldset id="header">
        <legend>Wakeword Training for Firefox Voice</legend>
        <div>
          Firefox Voice currently expects two wakewords: "Hey Firefox" and "Next
          slide please." This interface allows you to train a custom model that
          will listen for those keywords through transfer learning from an
          underlying model trained on the Google Speech Commands dataset.
        </div>
      </fieldset>
    </div>
  );
};

const SelectModel = ({ savedModels }) => {
  return (
    <div className="settings-content">
      <fieldset id="model-name">
        <legend>
          You currently have the following models saved:
        </legend>
        <div>
          <p>{savedModels.toString()}</p>
        </div>
        <div>
          <SaveTrainingExamples />
          <LoadTrainingExamples />
        </div>
      </fieldset>
    </div>
  );
};

const SaveTrainingExamples = () => {
  return (null);
}

const LoadTrainingExamples = () => {
  return (null);
}

const Trainer = ({
  onTrainExample,
  classesToTrain,
  onDeleteExample,
  onStartTraining,
}) => {
  return (
    <div class="settings-content">
      <fieldset id="trainer">
        <legend>Record training examples for each wakeword</legend>
        <div>
          <p>You should aim to record at least 40 examples per wakeword.</p>
          <p>
            <b>Settings (hard-coded): </b>
            Duration = 2x, including audio waveform, and mixing in noise for
            training.
          </p>
        </div>
        <table>
          <tr>
            <th class="training-class">Class to train</th>
            <th class="record">Record</th>
            <th>Existing recordings</th>
          </tr>
          {classesToTrain.map(function(cls) {
            return (
              <TrainingClass
                classItem={cls}
                key={cls.name}
                onTrainExample={onTrainExample}
                onDeleteExample={onDeleteExample}
              />
            );
          })}
        </table>
        <div>
          <TrainingInitiator onStartTraining={onStartTraining} />
        </div>
      </fieldset>
    </div>
  );
};

const TrainingClass = ({ classItem, onTrainExample, onDeleteExample }) => {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(-1);

  const setIndex = index => {
    setCurrentExampleIndex(index);
  };

  return (
    <tr>
      <td>{classItem.readableName}</td>
      <td>
        <ExampleRecorder
          word={classItem.name}
          onTrainExample={onTrainExample}
          numExamples={classItem.examples.length}
          setIndex={setIndex}
        />
      </td>
      <td>
        <TrainingExamples
          examples={classItem.examples}
          currentExampleIndex={currentExampleIndex}
          setIndex={setIndex}
          onDeleteExample={onDeleteExample}
        />
      </td>
    </tr>
  );
};

const TrainingInitiator = ({ onStartTraining }) => {
  const [trainingEpochs, setTrainingEpochs] = useState(25);
  const [fineTuningEpochs, setFineTuningEpochs] = useState(5);
  const [augmentWithNoise, setAugmentWithNoise] = useState(true);

  const changeTrainingEpochs = num => {
    setTrainingEpochs(num);
  };

  const changeFineTuningEpochs = num => {
    setFineTuningEpochs(num);
  };

  const changeAugmentWithNoise = shouldAugment => {
    setAugmentWithNoise(shouldAugment);
  };

  const handleStartTraining = async e => {
    let eventTarget = e.target;
    const originalText = eventTarget.innerText;
    eventTarget.innerText = "Training...";
    eventTarget.disabled = true;

    const trainingOptions = {
      epochs: parseInt(trainingEpochs),
      fineTuningEpochs: parseInt(fineTuningEpochs),
      augmentByMixingNoiseRatio: augmentWithNoise * 0.5,
    };
    console.log(trainingOptions);

    await onStartTraining(trainingOptions);
    eventTarget.innerText = originalText;
    eventTarget.disabled = false;
  };
  return (
    <React.Fragment>
      <h5>Training parameters</h5>
      <p>
        The example model that was demoed the week of June 8 was trained with 50
        examples each for "Hey Firefox" and "Next slide please," and 10 examples
        of background noise.
      </p>
      <p>
        The training parameters were set to 25 epochs, with 5 fine-tuning epochs
        and augmentation with noise enabled.
      </p>
      <div class="training-options">
        <TrainingEpochs
          trainingEpochs={trainingEpochs}
          changeTrainingEpochs={changeTrainingEpochs}
        />
        <FineTuningEpochs
          fineTuningEpochs={fineTuningEpochs}
          changeFineTuningEpochs={changeFineTuningEpochs}
        />
        <NoiseAugmentation
          augmentWithNoise={augmentWithNoise}
          changeAugmentWithNoise={changeAugmentWithNoise}
        />
      </div>
      <button onClick={handleStartTraining} className="styled-button wakeword">
        Start Training
      </button>
    </React.Fragment>
  );
};

const TrainingEpochs = ({ trainingEpochs, changeTrainingEpochs }) => {
  const handleChange = num => {
    changeTrainingEpochs(num);
  };
  return (
    <div className="training-container">
      <label htmlFor="training" className="label-training">
        Number of training epochs:
      </label>
      <input
        id="training"
        className="styled-input wakeword"
        type="text"
        placeholder="25"
        onChange={event => handleChange(event.target.value)}
        value={trainingEpochs}
      />
    </div>
  );
};

const FineTuningEpochs = ({ fineTuningEpochs, changeFineTuningEpochs }) => {
  const handleChange = num => {
    changeFineTuningEpochs(num);
  };
  return (
    <div className="fine-tuning-container">
      <label htmlFor="fine-tuning" className="label-fine-tuning">
        Number of fine-tuning epochs:
      </label>
      <input
        id="fine-tuning"
        className="styled-input wakeword"
        type="text"
        placeholder="5"
        onChange={event => handleChange(event.target.value)}
        value={fineTuningEpochs}
      />
    </div>
  );
};

const NoiseAugmentation = ({ augmentWithNoise, changeAugmentWithNoise }) => {
  const handleChange = shouldAugment => {
    changeAugmentWithNoise(shouldAugment);
  };
  return (
    <div className="augmentation-container">
      <label htmlFor="augmentation" className="label-augmentation">
        Augment with noise:
      </label>
      <input
        id="augmentation"
        type="checkbox"
        placeholder="5"
        onChange={event => handleChange(event.target.value)}
        checked={augmentWithNoise}
      />
    </div>
  );
};

const ExampleRecorder = ({ word, onTrainExample, numExamples, setIndex }) => {
  const recordExample = async e => {
    const eventTarget = e.target;
    eventTarget.classList.add("active");
    await onTrainExample(word);
    eventTarget.classList.remove("active");
    setIndex(numExamples);
  };

  return (
    <div>
      <button class="collect-example-button" onClick={recordExample}>
        <div class="recording-inner-circle" />
      </button>
    </div>
  );
};

const TrainingExamples = ({
  examples,
  currentExampleIndex,
  setIndex,
  onDeleteExample,
}) => {
  const handleExampleBack = () => {
    setIndex(currentExampleIndex - 1);
  };

  const handleExampleForward = () => {
    setIndex(currentExampleIndex + 1);
  };

  const handleDelete = () => {
    const example = examples[currentExampleIndex];
    handleExampleBack();
    onDeleteExample(example);
  };

  return (
    <div class="loaded-examples">
      <div class="example-tally">
        {currentExampleIndex >= 0
          ? `${currentExampleIndex + 1} of ${examples.length}`
          : "No recordings"}
      </div>
      {currentExampleIndex >= 0 ? (
        <div>
          <ExampleView example={examples[currentExampleIndex]} />
          <div class="example-navigation">
            <button
              onClick={handleExampleBack}
              disabled={currentExampleIndex - 1 < 0}
            >
              ←
            </button>
            <button
              onClick={handleExampleForward}
              disabled={currentExampleIndex + 1 === examples.length}
            >
              →
            </button>
            <button onClick={handleDelete}>x</button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ExampleView = ({ example }) => {
  log.info(example);
  const handleExamplePlay = e => {
    const eventTarget = e.target;
    eventTarget.disabled = true;
    speechCommands.utils.playRawAudio(
      example.example.rawAudio,
      () => (eventTarget.disabled = false)
    );
  };

  return (
    <button class="play-example" onClick={handleExamplePlay}>
      <span role="img" aria-label="play button">
        ▶️
      </span>{" "}
      Play
    </button>
  );
};

const Tester = () => {
  return null;
};
