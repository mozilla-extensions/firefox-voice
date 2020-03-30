/* eslint-disable no-unused-vars */

/* globals log */
export const Routines = ({
  updateNickname,
  registeredNicknames,
  useToggle,
  useEditNicknameDraft
}) => {
  const draft = useEditNicknameDraft(false, {
    name: "nicknames.combined",
    contexts: []
  });

  const createRoutine = () => {
    draft.setVisible(true);
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "settings-content"
  }, /*#__PURE__*/React.createElement("fieldset", null, /*#__PURE__*/React.createElement("legend", null, "Manage your Routines"), /*#__PURE__*/React.createElement("div", {
    className: "description-container"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "description"
  }, "Create a custom phrase to execute one or more actions"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    className: "styled-button new-routine-button",
    onClick: () => {
      createRoutine();
    }
  }, "+ New routine"))), /*#__PURE__*/React.createElement("br", null), draft.isVisible === true ? /*#__PURE__*/React.createElement(EditRoutineDraft, {
    draft: draft,
    updateNickname: updateNickname
  }) : null, /*#__PURE__*/React.createElement(RoutinesList, {
    registeredNicknames: registeredNicknames,
    updateNickname: updateNickname,
    useToggle: useToggle,
    useEditNicknameDraft: useEditNicknameDraft
  })));
};

const RoutineCard = ({
  nicknameContext,
  useToggle,
  updateNickname,
  useEditNicknameDraft
}) => {
  const draft = useEditNicknameDraft(false, nicknameContext);
  const allUtterances = [];
  const utterancesContexts = nicknameContext.contexts;

  if (utterancesContexts !== undefined) {
    for (let i = 0; i < utterancesContexts.length - 1; i++) {
      allUtterances.push(utterancesContexts[i].utterance + ", ");
    }

    if (utterancesContexts.length > 0) {
      allUtterances.push(utterancesContexts[utterancesContexts.length - 1].utterance);
    }
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement(RoutineMenu, {
    useToggle: useToggle,
    nicknameContext: nicknameContext,
    updateNickname: updateNickname,
    useEditNicknameDraft: useEditNicknameDraft,
    draft: draft
  }), /*#__PURE__*/React.createElement("h2", {
    className: "card-name"
  }, "\"", nicknameContext.nickname, "\""), /*#__PURE__*/React.createElement("h3", {
    className: "card-text"
  }, allUtterances), /*#__PURE__*/React.createElement("div", null, draft.isVisible === true ? /*#__PURE__*/React.createElement(EditRoutineDraft, {
    draft: draft,
    updateNickname: updateNickname,
    oldNicknameContext: nicknameContext
  }) : null));
};

const RoutinesList = ({
  registeredNicknames,
  updateNickname,
  useToggle,
  useEditNicknameDraft
}) => {
  const allNicks = [];

  for (const nick in registeredNicknames) {
    allNicks.push( /*#__PURE__*/React.createElement(RoutineCard, {
      nicknameContext: registeredNicknames[nick],
      useToggle: useToggle,
      updateNickname: updateNickname,
      useEditNicknameDraft: useEditNicknameDraft
    }));
  }

  return /*#__PURE__*/React.createElement("div", null, allNicks);
};

const RoutineMenu = ({
  useToggle,
  nicknameContext,
  updateNickname,
  draft
}) => {
  const menu = useToggle(false);

  const removeNickname = () => {
    updateNickname(undefined, nicknameContext.nickname);
    menu.setVisible(false);
  };

  const toggleDraft = () => {
    draft.setVisible(true);
    menu.setVisible(false);
  };

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "card-menu",
    ref: menu.ref
  }, /*#__PURE__*/React.createElement("button", {
    className: "no-style-button",
    onClick: () => menu.setVisible(!menu.isVisible)
  }, /*#__PURE__*/React.createElement("img", {
    src: "images/more-horizontal.svg",
    alt: "Routine Actions"
  })), menu.isVisible === true ? /*#__PURE__*/React.createElement("div", {
    className: "menu-box"
  }, /*#__PURE__*/React.createElement("button", {
    className: "no-style-button menu-button",
    onClick: () => toggleDraft()
  }, /*#__PURE__*/React.createElement("img", {
    src: "./images/edit.svg",
    alt: "Edit",
    className: "menu-icon"
  }), /*#__PURE__*/React.createElement("span", null, " Edit ")), /*#__PURE__*/React.createElement("button", {
    className: "no-style-button menu-button",
    onClick: () => removeNickname()
  }, /*#__PURE__*/React.createElement("img", {
    src: "./images/delete.svg",
    alt: "Remove",
    className: "menu-icon"
  }), /*#__PURE__*/React.createElement("span", null, " Remove "))) : null)));
};

const EditRoutineDraft = ({
  draft,
  updateNickname,
  oldNicknameContext
}) => {
  const save = async () => {
    if (draft.tempEditableNickname.nickname === undefined || draft.tempEditableNickname.nickname.length === 0) {
      log.error("This routine should have a name");
      return;
    }

    let oldNickname = undefined;

    if (oldNicknameContext !== undefined) {
      oldNickname = oldNicknameContext.nickname;
    }

    const allowed = await updateNickname(draft.tempEditableNickname, oldNickname);

    if (allowed === true) {
      draft.setVisible(false);
    } else {
      log.error("The intent was not saved");
    }
  };

  const changeNickname = nickname => {
    const nicknameContext = draft.tempEditableNickname;
    nicknameContext.nickname = nickname;
    draft.setTempEditableNickname(nicknameContext);
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "draft"
  }, /*#__PURE__*/React.createElement("div", {
    className: "draft-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nickname-container"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "nickname",
    className: "label-nickname"
  }, "When you say this:"), /*#__PURE__*/React.createElement("input", {
    id: "nickname",
    className: "styled-input",
    type: "text",
    placeholder: "Add name here",
    onChange: event => changeNickname(event.target.value),
    value: draft.tempEditableNickname.nickname
  })), /*#__PURE__*/React.createElement(UtteranceList, {
    draft: draft
  }), /*#__PURE__*/React.createElement("button", {
    className: "styled-button cancel-button",
    onClick: () => {
      draft.setVisible(false);
    }
  }, " ", "Cancel", " "), /*#__PURE__*/React.createElement("button", {
    className: "styled-button save-button",
    onClick: () => {
      save();
    }
  }, " ", "Save", " ")));
};

const UtteranceList = ({
  draft
}) => {
  const updateUtterance = (utterance, utteranceContext) => {
    if (utteranceContext !== undefined) {
      utteranceContext.utterance = utterance;
    } else {
      draft.tempEditableNickname.intents = utterance;
    }

    draft.setTempEditableNickname(draft.tempEditableNickname);
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "utterances-container"
  }, /*#__PURE__*/React.createElement("p", {
    className: "label-nickname"
  }, "Do this: "), /*#__PURE__*/React.createElement("textarea", {
    id: "utterances",
    className: "styled-input textarea-container",
    type: "text",
    onChange: event => {
      updateUtterance(event.target.value);
    },
    value: draft.tempEditableNickname.intents
  }));
};