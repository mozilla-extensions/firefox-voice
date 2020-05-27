/* globals communicate */

this.emailer = (function() {
  const SUBJECT = 'textarea[name="to"]';

  communicate.register(
    "searchFor",
    message => {
      /*
      const sub = document.querySelector(SUBJECT);
      sub.value = message.searchFor;
      sub.focus();
      */
    },
    true
  );
})();
