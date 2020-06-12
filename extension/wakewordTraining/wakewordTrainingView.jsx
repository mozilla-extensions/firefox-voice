/* eslint-disable no-unused-vars */
/* globals React */

export const WakewordTraining = ({ savedModels, onTrainExample, heyFirefoxExamples, nextSlidePleaseExamples, why }) => {
  return (
    <div id="wakeword-training-wrapper">
      <React.Fragment>
        <Header />
        <SelectModel savedModels={savedModels} />
        <Trainer onTrainExample={onTrainExample} heyFirefoxExamples={heyFirefoxExamples} nextSlidePleaseExamples={nextSlidePleaseExamples} />
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

const Trainer = ({ onTrainExample, heyFirefoxExamples, nextSlidePleaseExamples }) => {
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
        <ExampleRecorder
          word="Background noise"
          onTrainExample={onTrainExample}
        />
        <ExampleRecorder word="Hey Firefox" onTrainExample={onTrainExample} />
        <TrainingExamples word="Hey Firefox" examples={heyFirefoxExamples} />
        <ExampleRecorder
          word="Next slide please"
          onTrainExample={onTrainExample}
        />
        <TrainingExamples word="Next slide please" examples={nextSlidePleaseExamples} />

      </fieldset>
    </div>
  );
};

const ExampleRecorder = ({ word, onTrainExample }) => {
  const recordExample = async (e) => {
    await onTrainExample(word);
  };

  return (
    <div>
      <button class="collect-example-button" onClick={recordExample}>
        {word}
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
