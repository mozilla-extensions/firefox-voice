import * as serviceList from "./serviceList.js";

class CalendarService extends serviceList.Service {
  async getNextEventDetails() {
    await this.initTab(`/services/${this.id}/calendar.js`);
    const nextEventDetails = await this.callTab("getNextEventDetails");
    return nextEventDetails;
  }
}

export default CalendarService;
