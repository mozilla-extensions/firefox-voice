/* eslint-disable no-unused-vars */
/* globals log */

export const Routines = ({
  updateRoutine,
  registeredRoutines,
  useToggle,
  useEditRoutineDraft,
}) => {
  const draft = useEditRoutineDraft(false, {
    name: "routines.combined",
    contexts: [],
  });

  const createRoutine = () => {
    draft.setVisible(true);
  };

  return (
    <div className="settings-content">
      <fieldset>
        <legend>Manage your Routines</legend>
        <div className="description-container">
          <div className="description">
            Create a custom phrase to execute one or more actions.
          </div>
          <div>
            <button
              className="styled-button new-routine-button"
              onClick={() => {
                createRoutine();
              }}
            >
              <span className="plus-sign"> ＋ </span>
              New Routine
            </button>
          </div>
        </div>
        <br></br>
        {draft.isVisible === true ? (
          <EditRoutineDraft
            draft={draft}
            updateRoutine={updateRoutine}
          ></EditRoutineDraft>
        ) : null}
        <RoutinesList
          registeredRoutines={registeredRoutines}
          updateRoutine={updateRoutine}
          useToggle={useToggle}
          useEditRoutineDraft={useEditRoutineDraft}
        ></RoutinesList>
      </fieldset>
    </div>
  );
};

const RoutineCard = ({
  routineContext,
  useToggle,
  updateRoutine,
  useEditRoutineDraft,
}) => {
  const draft = useEditRoutineDraft(false, routineContext);
  const allUtterances = [];
  const utterancesContexts = routineContext.contexts;
  if (utterancesContexts !== undefined) {
    for (let i = 0; i < utterancesContexts.length - 1; i++) {
      allUtterances.push(utterancesContexts[i].utterance + ", ");
    }
    if (utterancesContexts.length > 0) {
      allUtterances.push(
        utterancesContexts[utterancesContexts.length - 1].utterance
      );
    }
  }
  return (
    <div className="card">
      <RoutineMenu
        useToggle={useToggle}
        routineContext={routineContext}
        updateRoutine={updateRoutine}
        useEditRoutineDraft={useEditRoutineDraft}
        draft={draft}
      ></RoutineMenu>
      <h2 className="card-name">"{routineContext.routine}"</h2>
      <h3 className="card-text">{allUtterances}</h3>
      <div>
        {draft.isVisible === true ? (
          <EditRoutineDraft
            draft={draft}
            updateRoutine={updateRoutine}
            oldRoutineContext={routineContext}
          ></EditRoutineDraft>
        ) : null}
      </div>
    </div>
  );
};

const RoutinesList = ({
  registeredRoutines,
  updateRoutine,
  useToggle,
  useEditRoutineDraft,
}) => {
  const allRoutines = [];

  for (const routines in registeredRoutines) {
    allRoutines.push(
      <RoutineCard
        routineContext={registeredRoutines[routines]}
        useToggle={useToggle}
        updateRoutine={updateRoutine}
        useEditRoutineDraft={useEditRoutineDraft}
      ></RoutineCard>
    );
  }

  return <div>{allRoutines}</div>;
};

const RoutineMenu = ({ useToggle, routineContext, updateRoutine, draft }) => {
  const menu = useToggle(false);

  const removeRoutine = () => {
    updateRoutine(undefined, routineContext.routine);
    menu.setVisible(false);
  };

  const toggleDraft = () => {
    draft.setVisible(true);
    menu.setVisible(false);
  };

  return (
    <div>
      <div>
        <div className="card-menu" ref={menu.ref}>
          <button
            className="no-style-button"
            onClick={() => menu.setVisible(!menu.isVisible)}
          >
            <img src="images/more-horizontal.svg" alt="Routine Actions"></img>
          </button>
          {menu.isVisible === true ? (
            <div className="menu-box">
              <button
                className="no-style-button menu-button"
                onClick={() => toggleDraft()}
              >
                <img
                  src="./images/edit.svg"
                  alt="Edit"
                  className="menu-icon"
                ></img>
                <span> Edit </span>
              </button>
              <button
                className="no-style-button menu-button"
                onClick={() => removeRoutine()}
              >
                <img
                  src="./images/delete.svg"
                  alt="Remove"
                  className="menu-icon"
                ></img>
                <span> Remove </span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const EditRoutineDraft = ({ draft, updateRoutine, oldRoutineContext }) => {
  const allFieldsCompleted = () => {
    return (
      draft.tempEditableRoutine.routine !== undefined &&
      draft.tempEditableRoutine.routine.length > 0 &&
      draft.tempEditableRoutine.intents !== undefined &&
      draft.tempEditableRoutine.intents.length > 0
    );
  };
  const save = async () => {
    if (
      draft.tempEditableRoutine.routine === undefined ||
      draft.tempEditableRoutine.routine.length === 0
    ) {
      draft.setErrorMessage("This Routine should have a name.");
      log.error("This routine should have a name");
      return;
    }

    let oldRoutine = undefined;
    if (oldRoutineContext !== undefined) {
      oldRoutine = oldRoutineContext.routine;
    }

    const { allowed, error } = await updateRoutine(
      draft.tempEditableRoutine,
      oldRoutine
    );
    if (allowed === true) {
      draft.setVisible(false);
    } else {
      draft.setErrorMessage(error);
    }
  };

  const changeRoutine = routine => {
    draft.setErrorMessage("");
    const routineContext = draft.tempEditableRoutine;
    routineContext.routine = routine;
    draft.setTempEditableRoutine(routineContext);
  };

  return (
    <div className="draft">
      <div className="draft-content">
        <div className="routine-container">
          <label htmlFor="routine" className="label-routine">
            When you say this:
          </label>
          <input
            id="routine"
            className="styled-input"
            type="text"
            placeholder="Add name here"
            onChange={event => changeRoutine(event.target.value)}
            value={draft.tempEditableRoutine.routine}
          />
        </div>
        <UtteranceList draft={draft}></UtteranceList>
        {draft.errorMessage ? (
          <div className="error-message"> {draft.errorMessage} </div>
        ) : null}

        <button
          className="styled-button cancel-button"
          onClick={() => {
            draft.setVisible(false);
          }}
        >
          {" "}
          Cancel{" "}
        </button>
        <button
          className={`styled-button ${
            allFieldsCompleted() ? "save-button-allowed" : "save-button"
          }`}
          onClick={() => {
            save();
          }}
        >
          {" "}
          Save{" "}
        </button>
      </div>
    </div>
  );
};

const UtteranceList = ({ draft }) => {
  const updateUtterance = (utterance, utteranceContext) => {
    draft.setErrorMessage("");
    if (utteranceContext !== undefined) {
      utteranceContext.utterance = utterance;
    } else {
      draft.tempEditableRoutine.intents = utterance;
    }
    draft.setTempEditableRoutine(draft.tempEditableRoutine);
  };

  return (
    <div className="utterances-container">
      <p className="label-routine">Do this: </p>
      <textarea
        id="utterances"
        className="styled-input textarea-container"
        type="text"
        placeholder="Type your actions here, separated by enter"
        onChange={event => {
          updateUtterance(event.target.value);
        }}
        value={draft.tempEditableRoutine.intents}
      />
    </div>
  );
};
