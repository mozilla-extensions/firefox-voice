/* eslint-disable no-unused-vars, speechCommands */
/* globals React */

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
          Would you like to train a new model, or load an existing model for
          testing or updating?
        </legend>
        <div>
          <p>{savedModels.toString()}</p>
        </div>
      </fieldset>
    </div>
  );
};

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
  return (
    <React.Fragment>
      <p>
        Currently using the default settings of 25 epochs and 5 fine-tuning
        epochs.
      </p>
      <button onClick={onStartTraining}>Start Training</button>
    </React.Fragment>
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
              disabled={currentExampleIndex + 1 == examples.length}
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
      ▶️ Play
    </button>
  );
};

const Tester = () => {
  return null;
};
