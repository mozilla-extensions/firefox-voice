/* globals helpers */

this.calendar = (function() {
  class Calendar extends helpers.Runner {
    action_getNextEventDetails() {
      const CURRENT_DAY = ".YvjgZe.F262Ye";
      const EVENT = ".NlL62b";
      const TIME_BAR = ".H3tRZe";
      const EVENT_NAME = ".FAxxKc";
      const EVENT_TIME = ".A6wOnd, .gVNoLb";

      const todayColumn = document.querySelector(CURRENT_DAY);
      const eventsToday = todayColumn
        ? todayColumn.querySelectorAll(EVENT)
        : document.querySelectorAll(EVENT);
      const timeBar = document.querySelector(TIME_BAR);

      const verticalOffsetOfTimeBar = parseInt(timeBar.style.top, 10);
      const verticalOffsetsOfEvents = Array.from(eventsToday).map(ev =>
        parseInt(ev.style.top, 10)
      );

      let relevantEvents = [];
      let timeOfUpcomingEvent;

      for (const [index, eventTime] of verticalOffsetsOfEvents.entries()) {
        if (eventTime < verticalOffsetOfTimeBar) continue;
        if (timeOfUpcomingEvent && eventTime > timeOfUpcomingEvent) break;
        timeOfUpcomingEvent = eventTime;
        relevantEvents.push(index);
      }

      relevantEvents = relevantEvents.map(eventIndex => {
        const eventNode = eventsToday[eventIndex];
        const eventTimeString = eventNode.querySelector(EVENT_TIME).innerText;
        const [startTime, endTime] = eventTimeString.split(" – ");
        return {
          eventName: eventNode.querySelector(EVENT_NAME).innerText,
          startTime,
          endTime,
        };
      });

      return relevantEvents;
    }
  }

  Calendar.register();
})();
