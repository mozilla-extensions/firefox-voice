/* eslint-disable no-unused-vars */
/* globals React */

export const WakewordTraining = ({
    savedModels
}) => {
    return (
      <div id="wakeword-training-wrapper">
        <React.Fragment>
            <Header />
            <SelectModel
                savedModels={savedModels}
            />
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
                    Firefox Voice currently expects two wakewords: "Hey Firefox" and "Next slide please." This interface allows you to train a custom model that will listen for those keywords through transfer learning from an underlying model trained on the Google Speech Commands dataset. 
                </div>
            </fieldset>
        </div>
    );
};

const SelectModel = ({savedModels}) => {
    return (
        <div className="settings-content">
            <fieldset id="model-name">
                <legend>Would you like to train a new model, or load an existing model for testing or updating?</legend>
                <div>
                    <p>{savedModels.toString()}</p>
                </div>
            </fieldset>
        </div>
    );
};
