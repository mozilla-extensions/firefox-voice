/* eslint-disable no-unused-vars */

/* globals React */
export const Homepage = ({
  isCommonVoice
}) => {
  return /*#__PURE__*/React.createElement("div", {
    id: "homepage-wrapper"
  }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DraftBanner, null), /*#__PURE__*/React.createElement(Header, null), isCommonVoice && /*#__PURE__*/React.createElement(CommonVoiceWelcome, null), /*#__PURE__*/React.createElement(HomepagePageContent, null), /*#__PURE__*/React.createElement(Footer, null)));
};

const DraftBanner = () => {
  return /*#__PURE__*/React.createElement("div", {
    class: "draft-banner mzp-l-content"
  }, /*#__PURE__*/React.createElement("strong", null, "DRAFT WEBSITE"), /*#__PURE__*/React.createElement("span", {
    class: "draft-details"
  }, "The content on this website is a work-in-progress, and may include broken links, incomplete styles, and placeholders"));
};

const CommonVoiceWelcome = () => {
  return /*#__PURE__*/React.createElement("aside", {
    class: "mzp-c-notification-bar common-voice-welcome"
  }, /*#__PURE__*/React.createElement("img", {
    class: "robot-profile",
    alt: "Profile of the Common Voice robot illustration",
    src: "./images/robot-profile.svg"
  }), /*#__PURE__*/React.createElement("p", null, "Welcome Common Voice contributor! Help us build an open voice ecosystem. After installing, please allow Firefox Voice to collect voice samples.", " ", /*#__PURE__*/React.createElement("a", {
    href: "https://voice.mozilla.org/"
  }, "Learn more"), "."));
};

const Header = () => {
  return /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-navigation"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-navigation-l-content"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-navigation-container"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-navigation-logo"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://voice.mozilla.org/"
  }, "Firefox Voice")), /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-navigation-items"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-navigation-menu"
  }, /*#__PURE__*/React.createElement("nav", {
    class: "mzp-c-menu mzp-is-basic"
  }, /*#__PURE__*/React.createElement("ul", {
    class: "mzp-c-menu-category-list"
  }, /*#__PURE__*/React.createElement("li", {
    class: "mzp-c-menu-category"
  }, /*#__PURE__*/React.createElement("a", {
    class: "mzp-c-menu-title",
    href: "#how-it-works"
  }, "How it works")), /*#__PURE__*/React.createElement("li", {
    class: "mzp-c-menu-category"
  }, /*#__PURE__*/React.createElement("a", {
    class: "mzp-c-menu-title",
    href: "#faq"
  }, "FAQs")))))))));
};

const HomepagePageContent = () => {
  return /*#__PURE__*/React.createElement("div", {
    id: "homepage-content"
  }, /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(ExampleActions, null), /*#__PURE__*/React.createElement(OpenVoiceEcosystem, null), /*#__PURE__*/React.createElement(Demo, null), /*#__PURE__*/React.createElement(Faq, null));
};

const Hero = () => {
  return /*#__PURE__*/React.createElement("section", {
    class: "mzp-c-hero"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-l-content"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-hero-body"
  }, /*#__PURE__*/React.createElement("h1", {
    class: "mzp-c-hero-title mzp-has-zap-17"
  }, "Browse the web with ", /*#__PURE__*/React.createElement("strong", null, "your voice")), /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-hero-desc"
  }, /*#__PURE__*/React.createElement("p", null, "Firefox Voice lets you browse and get more done\u2014faster than ever. Simply install the browser add-on, then command the entire internet with just your voice.")), /*#__PURE__*/React.createElement("p", {
    class: "mzp-c-hero-cta"
  }, /*#__PURE__*/React.createElement("a", {
    class: "mzp-c-button mzp-t-product install-cta",
    href: "https://va.allizom.org/releases/prod/firefox-voice.xpi"
  }, "Install Firefox Voice"), /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-availability"
  }, "Available as an extension for Firefox on desktop / laptop. Android coming soon.", /*#__PURE__*/React.createElement("br", null), "Requires a working microphone.")))));
};

const ExampleActions = () => {
  return /*#__PURE__*/React.createElement("div", {
    class: "mzp-l-content"
  }, /*#__PURE__*/React.createElement("section", {
    class: "mzp-c-emphasis-box box-purple"
  }, /*#__PURE__*/React.createElement("h6", {
    class: "things-you-can-do"
  }, "Things you can do"), /*#__PURE__*/React.createElement("div", {
    class: "action-categories"
  }, /*#__PURE__*/React.createElement(ActionCategory, {
    icon: "search",
    categoryLabel: "Search & Navigate",
    exampleUtterances: ["Go to The New York Times", "Search legos on Amazon", "Show me the Warriors schedule", "Search my Google Docs for team meeting notes"]
  }), /*#__PURE__*/React.createElement(ActionCategory, {
    icon: "music",
    categoryLabel: "Play Music",
    exampleUtterances: ["Play Jazz on Spotify", "Play Green Day on YouTube", "Pause", "Next"]
  }), /*#__PURE__*/React.createElement(ActionCategory, {
    icon: "browser",
    categoryLabel: "Browser Controls",
    exampleUtterances: ["Find my calendar tab", "Scroll down", "Print", "Reload this page", "Screenshot"]
  })), /*#__PURE__*/React.createElement("div", {
    class: "see-all-actions"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://voice.mozilla.org/"
  }, "Everything you can say"))));
};

const ActionCategory = ({
  icon,
  categoryLabel,
  exampleUtterances
}) => {
  return /*#__PURE__*/React.createElement("div", {
    class: "action-category"
  }, /*#__PURE__*/React.createElement("div", {
    class: "action-logo"
  }, /*#__PURE__*/React.createElement("img", {
    src: "./images/" + icon + ".svg",
    alt: icon + " icon"
  })), /*#__PURE__*/React.createElement("div", {
    class: "category-label"
  }, categoryLabel), /*#__PURE__*/React.createElement("div", {
    class: "example-utterance-wrapper"
  }, /*#__PURE__*/React.createElement("ul", null, exampleUtterances.map(example => /*#__PURE__*/React.createElement("li", null, "\u201C", example, "\u201D")))));
};

const OpenVoiceEcosystem = () => {
  return /*#__PURE__*/React.createElement("div", {
    class: "mzp-l-content mzp-l-card-half"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-l-flexcards"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-card"
  }, /*#__PURE__*/React.createElement("h6", {
    class: "card-header mzp-has-zap-14"
  }, "An ", /*#__PURE__*/React.createElement("strong", null, "open voice"), " ecosystem"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "At Mozilla we\u2019re trying to build an open voice ecosystem that is both private and secure. To do this, we\u2019ve developed tools such as", " ", /*#__PURE__*/React.createElement("a", {
    href: "https://voice.mozilla.org/"
  }, "Common Voice"), " to collect the necessary data to teach our systems how to recognize a wider variety of diverse voices, in all sorts of environments."), /*#__PURE__*/React.createElement("p", null, "Now you can help by choosing to let us store your Firefox Voice requests\u2014securely, without accompanying personally identifiable information\u2014and use them to improve our research. We won't share them outside of Mozilla."))), /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-card"
  }, /*#__PURE__*/React.createElement("img", {
    class: "common-voice-robot",
    alt: "Illustration of Mars, the Common Voice robot logo",
    src: "./images/common-voice-robot.png"
  }))));
};

const Demo = () => {
  return /*#__PURE__*/React.createElement("div", {
    id: "how-it-works",
    class: "mzp-l-content mzp-l-card-half"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-l-flexcards"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-card"
  }, /*#__PURE__*/React.createElement("div", {
    class: "video-wrapper"
  }, /*#__PURE__*/React.createElement("iframe", {
    title: "Firefox Voice Demo Video",
    src: "https://www.youtube.com/embed/3sqKsfj8WRE",
    frameborder: "0",
    allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
    allowfullscreen: true
  }))), /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-card"
  }, /*#__PURE__*/React.createElement("h6", {
    class: "card-header mzp-has-zap-11"
  }, "See how it ", /*#__PURE__*/React.createElement("strong", null, "works")), /*#__PURE__*/React.createElement("div", null, "Whether you need to maintain your focus or just have your hands full, now you can go hands-free to navigate the web and retrieve information instantly.", /*#__PURE__*/React.createElement("div", {
    class: "watch-video"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://voice.mozilla.org/"
  }, "Watch the video"))))));
};

const Faq = () => {
  return /*#__PURE__*/React.createElement("div", {
    id: "faq",
    class: "mzp-l-content mzp-l-core"
  }, /*#__PURE__*/React.createElement("h5", {
    class: "mzp-has-zap-17 faq-title"
  }, /*#__PURE__*/React.createElement("strong", null, "Frequently asked questions")), /*#__PURE__*/React.createElement("section", {
    class: "faq"
  }, /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("div", {
    class: "faq-section-header"
  }, "What is Firefox Voice?")), /*#__PURE__*/React.createElement("p", null, "Firefox Voice is an experimental Add-On for the Firefox Browser that enables voice interactions. You can ask things like \u201CSearch for sushi in Auckland\u201D, \u201CClose tab\u201D or \u201CHow tall is Mount Everest?\u201D"), /*#__PURE__*/React.createElement("p", null, "Currently, Firefox Voice is available for the Desktop browsers, only supports English, and requires a user to", " ", /*#__PURE__*/React.createElement("a", {
    href: "https://events.mozilla.org/firefoxvoicecampaign"
  }, "manually download and install the Add-on from the campaign page"), ", grant permission for microphone access, and trigger the microphone to listen by clicking on an icon in the toolbar or using a keyboard shortcut.")), /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("div", {
    class: "faq-section-header"
  }, "When is the microphone active and listening?")), /*#__PURE__*/React.createElement("p", null, "The microphone for Firefox Voice is only active when triggered with a button press or keyboard shortcut. We strive to make it clear anytime Firefox Voice is listening as privacy and trust are central to Firefox Voice and Mozilla."), /*#__PURE__*/React.createElement("p", null, "The microphone access is paused between use, so you may notice an operating system indicator that Firefox is retaining the microphone.")), /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("div", {
    class: "faq-section-header"
  }, "Are my audio recordings stored?")), /*#__PURE__*/React.createElement("p", null, "By default Firefox Voice does ", /*#__PURE__*/React.createElement("strong", null, "not"), " store your voice recordings after processing. Users may enable audio recordings to be stored for purposes of improving our speech detection service but it is not required or enabled by default, nor are we promoting this option currently.")), /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("div", {
    class: "faq-section-header"
  }, "Are my voice recordings transcribed and stored?")), /*#__PURE__*/React.createElement("p", null, "For the initial Beta release we ask participants to allow transcriptions during the installation process. Even if participants opt-out of allowing transcriptions they are able to use Firefox Voice."), /*#__PURE__*/React.createElement("p", null, "When participants opt-in, transcripts are used for research purposes to improve Firefox Voice and related services. Transcriptions and related data are stored securely and without personally identifying information."), /*#__PURE__*/React.createElement("p", null, "In the Preferences you can additionally allow us to keep your audio for speech-to-text training purposes. This is off by default.")), /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("div", {
    class: "faq-section-header"
  }, "When will this automatically be included into Firefox?")), /*#__PURE__*/React.createElement("p", null, "The current Beta release of Firefox Voice is an experiment to better understand the needs and desire for voice interactions within the browser. At this time no decision has been made on when or if the add-on will come bundled by default with Firefox. Future development depends on feedback and performance of the Add-On.")), /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("div", {
    class: "faq-section-header"
  }, "What other voice experiments is Mozilla working on?")), /*#__PURE__*/React.createElement("p", null, "Mozilla is experimenting with voice in a number projects including:"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://voice.mozilla.org/"
  }, "Common Voice"), ": A crowdsourcing project to create a free database for speech recognition software. The project is supported by volunteers who record sample sentences with a microphone and review recordings of other users."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/mozilla/TTS"
  }, "Mozilla TTS"), ": A deep learning based Text2Speech engine, low in cost and high in quality."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/mozilla/DeepSpeech"
  }, "Project DeepSpeech"), ": An open source Speech-To-Text engine, using a model trained by machine learning techniques."))), /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("div", {
    class: "faq-section-header"
  }, "How is my audio processed?")), /*#__PURE__*/React.createElement("p", null, "When you make a request using Firefox Voice, the browser captures the audio and uses cloud-based services to transcribe and then process the request. Below are the steps and services utilized."), /*#__PURE__*/React.createElement("ol", null, /*#__PURE__*/React.createElement("li", null, "The microphone must be opened with a button press or keyboard shortcut."), /*#__PURE__*/React.createElement("li", null, "After you finish speaking the microphone is turned off."), /*#__PURE__*/React.createElement("li", null, "Audio from your voice request is sent to Mozilla\u2019s Voicefill server without any personally identifiable metadata."), /*#__PURE__*/React.createElement("li", null, "Voicefill sends the audio to Google\u2019s Speech-to-Text engine, which returns transcribed text. We\u2019ve instructed the Google Speech-to-Text engine to NOT save any recordings. Note: In the future, we expect to enable Mozilla\u2019s own technology for Speech-to-Text which enables us to stop using Google\u2019s Speech-to-Text engine."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("div", null, "Based on the transcribed text, Firefox Voice attempts to fulfill your request."), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "For example, if you say \u201CGo to\u2026\u201D or \u201CFind\u2026\u201D a Search using your default search engine will be executed. Note: if you\u2019re using Google Search and are logged into your Google account in Firefox, your search will be associated with your Google search history."), /*#__PURE__*/React.createElement("li", null, "Requests such as \u201CClose tab\u201D or \u201CRead this page\u201D are processed directly by the browser."))), /*#__PURE__*/React.createElement("li", null, "We\u2019ve instructed Google Speech-to-text not to retain audio once the request has been processed. In addition, Mozilla does not retain any audio unless you\u2019ve actively chosen to allow Mozilla to collect audio recordings for the purpose of improving our speech recognition service.")))));
};

const Footer = () => {
  return /*#__PURE__*/React.createElement("footer", {
    class: "mzp-c-footer"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-l-content"
  }, /*#__PURE__*/React.createElement("nav", {
    class: "mzp-c-footer-primary"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-footer-primary-logo"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://www.mozilla.org/"
  }, "Mozilla")), /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-footer-items"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-footer-item"
  }, "Installation Instructions"), /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-footer-item"
  }, "GitHub"), /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-footer-item"
  }, "Feedback"), /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-footer-item"
  }, "Privacy"))), /*#__PURE__*/React.createElement("nav", {
    class: "mzp-c-footer-secondary"
  }, /*#__PURE__*/React.createElement("div", {
    class: "mzp-c-footer-legal"
  }, /*#__PURE__*/React.createElement("p", {
    class: "mzp-c-footer-license"
  }, "Visit Mozilla Corporation\u2019s not-for-profit parent, the", " ", /*#__PURE__*/React.createElement("a", {
    href: "https://foundation.mozilla.org/"
  }, "Mozilla Foundation"), ".", /*#__PURE__*/React.createElement("br", null), " Portions of this content are \xA91998\u20132018 by individual mozilla.org contributors. Content available under a", " ", /*#__PURE__*/React.createElement("a", {
    rel: "license",
    href: "https://www.mozilla.org/foundation/licensing/website-content/"
  }, "Creative Commons license"), ".")))));
};