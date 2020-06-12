/* eslint-disable no-unused-vars */
/* globals React */

const { useState } = React;


export const WakewordTraining = ({ savedModels, onTrainExample, heyFirefoxExamples, nextSlidePleaseExamples, backgroundNoiseExamples }) => {
  const CLASSES_TO_TRAIN = [
    {
      name: "heyFirefox",
      readableName: "Hey Firefox",
      examples: heyFirefoxExamples
    },
    {
      name: "nextSlidePlease",
      readableName: "Next slide please",
      examples: nextSlidePleaseExamples
    },
    {
      name: "_background_noise_",
      readableName: "Background noise",
      examples: backgroundNoiseExamples
    }
  ]
  return (
    <div id="wakeword-training-wrapper">
      <React.Fragment>
        <Header />
        <SelectModel savedModels={savedModels} />
        <Trainer classesToTrain={CLASSES_TO_TRAIN} onTrainExample={onTrainExample} />
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

const Trainer = ({ onTrainExample, classesToTrain }) => {
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
            {
              classesToTrain.map(function (cls) { 
                return <TrainingClass classItem={cls} key={cls.name} onTrainExample={onTrainExample} />
              })
            }
        </table>
      </fieldset>
    </div>
  );
};

const TrainingClass = ({classItem, onTrainExample }) => {
  return (
    <tr>
      <td>
        {classItem.readableName}
      </td>
      <td>
        <ExampleRecorder
          word={classItem.name}
          onTrainExample={onTrainExample}
        />
      </td>
      <td>
        <TrainingExamples examples={classItem.examples} />
      </td>
    </tr>
  );
}

const ExampleRecorder = ({ word, onTrainExample }) => {
  const recordExample = async (e) => {
    const eventTarget = e.target;
    eventTarget.classList.add("active");
    await onTrainExample(word);
    eventTarget.classList.remove("active");
  };

  return (
    <div>
      <button class="collect-example-button" onClick={recordExample}>
        <div class="recording-inner-circle" />
      </button>
    </div>
  );
};

const TrainingExamples = ({examples}) => {
    return (
        <div>
            {examples.length}
        </div>
    )
}

const Tester = () => {
  return null;
};
