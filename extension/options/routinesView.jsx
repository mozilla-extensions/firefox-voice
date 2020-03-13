/* eslint-disable no-unused-vars */

export const Routines = ({
  updateNickname,
  registeredNicknames,
  useToggle,
  useEditNicknameModal,
  parseUtterance,
}) => {
  const editModal = useEditNicknameModal(false, {
    name: "nicknames.combined",
    contexts: [],
  });

  const createRoutine = () => {
    editModal.setVisible(true);
  };

  return (
    <div className="settings-content">
      <fieldset>
        <legend>Manage your Routines</legend>
        <div className="description-container">
          <h2 className="description">
            Create a custom phrase to execute one or more actions
          </h2>
          <div>
            <button
              className="styled-button new-routine-button"
              onClick={() => {
                createRoutine();
              }}
            >
              + New routine
            </button>
          </div>
        </div>
        <br></br>
        <RoutinesList
          registeredNicknames={registeredNicknames}
          updateNickname={updateNickname}
          useToggle={useToggle}
          useEditNicknameModal={useEditNicknameModal}
          parseUtterance={parseUtterance}
        ></RoutinesList>
        {editModal.isVisible === true ? (
          <EditRoutineModal
            modal={editModal}
            updateNickname={updateNickname}
            parseUtterance={parseUtterance}
          ></EditRoutineModal>
        ) : null}
      </fieldset>
    </div>
  );
};

const RoutinesList = ({
  registeredNicknames,
  updateNickname,
  useToggle,
  useEditNicknameModal,
  parseUtterance,
}) => {
  const allNicks = [];
  for (const nick in registeredNicknames) {
    const allUtterances = [];
    const utterancesContexts = registeredNicknames[nick].contexts;
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

    allNicks.push(
      <div className="card">
        <RoutineMenu
          useToggle={useToggle}
          nicknameContext={{ ...registeredNicknames[nick] }}
          updateNickname={updateNickname}
          useEditNicknameModal={useEditNicknameModal}
          parseUtterance={parseUtterance}
        ></RoutineMenu>
        <h2 className="card-name">"{registeredNicknames[nick].nickname}"</h2>
        <h3 className="card-text">{allUtterances}</h3>
      </div>
    );
  }

  return <div>{allNicks}</div>;
};

const RoutineMenu = ({
  useToggle,
  nicknameContext,
  updateNickname,
  useEditNicknameModal,
  parseUtterance,
}) => {
  const menu = useToggle(false);
  const editModal = useEditNicknameModal(false, nicknameContext);

  const removeNickname = () => {
    updateNickname(undefined, nicknameContext.nickname);
    menu.setVisible(false);
  };

  const toggleModal = () => {
    editModal.setVisible(true);
    menu.setVisible(false);
  };

  return (
    <div>
      {editModal.isVisible === true ? (
        <EditRoutineModal
          modal={editModal}
          updateNickname={updateNickname}
          oldNicknameContext={nicknameContext}
          parseUtterance={parseUtterance}
        ></EditRoutineModal>
      ) : null}
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
              onClick={() => toggleModal()}
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
              onClick={() => removeNickname()}
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
  );
};

const EditRoutineModal = ({
  modal,
  updateNickname,
  oldNicknameContext,
  parseUtterance,
}) => {
  const save = async () => {
    if (modal.tempEditableNickname.nickname.length === 0) {
      return;
    }

    if (modal.tempEditableNickname.contexts.length === 0) {
      return;
    }

    let oldNickname = undefined;
    if (oldNicknameContext !== undefined) {
      oldNickname = oldNicknameContext.nickname;
    }

    const allowed = await updateNickname(
      modal.tempEditableNickname,
      oldNickname
    );
    if (allowed === true) modal.setVisible(false);
  };

  const changeNickname = nickname => {
    const nicknameContext = modal.tempEditableNickname;
    nicknameContext.nickname = nickname;
    modal.setTempEditableNickname(nicknameContext);
  };

  return (
    <div className="modal">
      <div className="modal-content" ref={modal.ref}>
        <div className="nickname-container">
          <label htmlFor="nickname" className="nickname-label">
            Routine
          </label>
          <input
            id="nickname"
            className="styled-input"
            type="text"
            placeholder="Add name here"
            onChange={event => changeNickname(event.target.value)}
            value={modal.tempEditableNickname.nickname}
          />
        </div>
        <UtteranceList
          modal={modal}
          parseUtterance={parseUtterance}
        ></UtteranceList>
        <button
          className="styled-button modal-button"
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

const UtteranceList = ({ modal, parseUtterance }) => {
  const updateUtterance = (utterance, utteranceContext) => {
    if (utteranceContext !== undefined) {
      utteranceContext.utterance = utterance;
    } else {
      modal.tempEditableNickname.temporaryUtterance = utterance;
    }
    modal.setTempEditableNickname(modal.tempEditableNickname);
  };
  const deleteUtterance = utteranceContext => {
    const utteranceContexts = modal.tempEditableNickname.contexts;

    modal.tempEditableNickname.contexts = utterancesContexts.filter(
      nicknameContext => {
        return nicknameContext !== utteranceContext;
      }
    );

    modal.setTempEditableNickname(modal.tempEditableNickname);
  };

  const addUtterance = async () => {
    const utteranceContext = await parseUtterance(
      modal.tempEditableNickname.temporaryUtterance
    );
    if (
      utteranceContext === undefined ||
      utteranceContext.utterance === undefined
    ) {
      return;
    }
    modal.tempEditableNickname.contexts.push(utteranceContext);
    modal.tempEditableNickname.temporaryUtterance = "";
    modal.setTempEditableNickname(modal.tempEditableNickname);
  };

  const utterances = [];
  const utterancesContexts = modal.tempEditableNickname.contexts;
  for (let i = 0; i < utterancesContexts.length; i++) {
    utterances.push(
      <li>
        <input
          className="styled-input"
          type="text"
          onChange={event => {
            updateUtterance(event.target.value, utterancesContexts[i]);
          }}
          value={utterancesContexts[i].utterance}
        />
        <button
          className="no-style-button"
          onClick={() => {
            deleteUtterance(utterancesContexts[i]);
          }}
        >
          <img
            src="./images/delete.svg"
            alt="Remove"
            className="menu-icon delete-utterance"
          ></img>
        </button>
      </li>
    );
  }
  return (
    <div id="utterance-list">
      <ul>{utterances}</ul>
      <input
        className="styled-input"
        type="text"
        onChange={event => {
          updateUtterance(event.target.value);
        }}
        value={modal.tempEditableNickname.temporaryUtterance}
      />
      <button
        className="no-style-button"
        onClick={() => {
          addUtterance();
        }}
      >
        <img
          src="./images/new.svg"
          alt="New"
          className="menu-icon delete-utterance"
        ></img>
      </button>
    </div>
  );
};
