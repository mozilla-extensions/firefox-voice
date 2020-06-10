import * as calendar from "../../intents/calendar/calendar.js";
import CalendarService from "../../background/calendarService.js";

class Gcal extends CalendarService {}

Object.assign(Gcal, {
  id: "gcal",
  title: "Gcal",
  baseUrl: "https://calendar.google.com",
});

calendar.register(Gcal);
