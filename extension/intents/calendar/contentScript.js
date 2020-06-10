const CURRENT_DAY = ".YvjgZe.F262Ye";
const EVENT = ".NlL62b";
const TIME_BAR = ".H3tRZe";

const todayColumn = document.querySelector(CURRENT_DAY);
const eventsToday = todayColumn.querySelectorAll(EVENT);
const timeBar = document.querySelector(TIME_BAR);

const verticalOffsetOfTimeBar = parseInt(timeBar.style.top, 10);
const verticalOffsetsOfEvents = Array.from(eventsToday).map(ev => parseInt(ev.style.top, 10));

// account for the fact that multiple events may have the same start time