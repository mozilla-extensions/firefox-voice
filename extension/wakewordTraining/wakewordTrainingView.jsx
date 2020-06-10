/* eslint-disable no-unused-vars */
/* globals React */

export const WakewordTraining = ({}) => {
    return (
      <div id="wakeword-training-wrapper">
        <React.Fragment>
            <SelectModel />
        </React.Fragment>
      </div>
    );
};
  
const SelectModel = () => {
    return (
        <div className="settings-content">
            <fieldset id="model-name">
                <legend>Training for model NAME</legend>
                <div>
                    Firefox Voice currently expects two wakewords: "Hey Firefox" and "Next slide please." This interface allows you to train a custom model that will listen for those keywords through transfer learning from an underlying model trained on the Google Speech Commands dataset. 
                </div>
            </fieldset>
        </div>
    );
};
