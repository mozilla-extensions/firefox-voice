/* eslint-disable no-unused-vars */
/* globals React */

import * as browserUtil from "../browserUtil.js";

export const Homepage = ({
  isCommonVoice,
}) => {
  return (
    <div id="homepage-wrapper">
      <React.Fragment>
        <Header />
        {isCommonVoice && (
          <CommonVoiceWelcome />
        )}
        <HomepagePageContent />
        <Footer />
      </React.Fragment>
    </div>
  );
};

const Header = () => {
  return (
    <div class="mzp-c-navigation">
      <div class="mzp-c-navigation-l-content">
        <div class="mzp-c-navigation-container">
          <button class="mzp-c-navigation-menu-button" type="button" aria-controls="patterns.organisms.navigation.navigation">Menu</button>

          <div class="mzp-c-navigation-items" id="patterns.organisms.navigation.navigation">
            <div class="mzp-c-navigation-menu">

              <nav class="mzp-c-menu mzp-is-basic">
                <ul class="mzp-c-menu-category-list">
                  <li class="mzp-c-menu-category">
                    <a class="mzp-c-menu-title" href="https://www.mozilla.org/">Sample Link</a>
                  </li>
                  <li class="mzp-c-menu-category">
                    <a class="mzp-c-menu-title" href="https://www.mozilla.org/">Another</a>
                  </li>
                  <li class="mzp-c-menu-category">
                    <a class="mzp-c-menu-title" href="https://www.mozilla.org/">Another</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomepagePageContent = () => {
  return (
    <div id="homepage-content">
      <Hero />
      <ExampleActions />
      <OpenVoiceEcosystem />
      <Demo />
      <Faq />
    </div>
  );
};

const Hero = () => {
  return (
    <section class="mzp-c-hero">
      <div class="mzp-l-content">
        <div class="mzp-c-hero-body">
          <h1 class="mzp-c-hero-title mzp-has-zap-17">Browse the web with <strong>your voice</strong></h1>

          <div class="mzp-c-hero-desc">
            <p>Firefox Voice lets you browse and get more done&mdash;faster than ever. Simply install the browser add-on, then command the entire internet with just your voice.</p>
          </div>

          <p class="mzp-c-hero-cta">
            <a class="mzp-c-button mzp-t-product" href="#">Install Firefox Voice</a>
            <div class="mzp-c-availability">
              Available as an extension for Firefox on desktop / laptop. Android coming soon.<br/>
              Requires a working microphone.
            </div>
          </p>
        </div>
      </div>
    </section>
  );
};

const ExampleActions = () => {
  return (
    <section class="mzp-c-emphasis-box color-violet-80">
      <h6>Things you can do</h6>

      <div class="action-categories">
        <ActionCategory 
          icon={"path/to/icon"}
          categoryLabel={"Search & Navigate"}
          exampleUtterances={["Go to The New York Times", "Search legos on Amazon", "Show me the Warriors schedule", "Search my Google Docs for team meeting notes"]}
        />

        <ActionCategory 
          icon={"path/to/icon"}
          categoryLabel={"Play Music"}
          exampleUtterances={["Play Jazz on Spotify", "Play Green Day on YouTube", "Pause", "Next"]}
        />

        <ActionCategory 
          icon={"path/to/icon"}
          categoryLabel={"Browser Controls"}
          exampleUtterances={["Find my calendar tab", "Scroll down", "Print", "Reload this page", "Screenshot"]}
        />
      </div>

      <div class="see-all-actions">
        <a href="">Everything you can say</a>
      </div>
    </section>
  );
};

const ActionCategory = ({icon, categoryLabel, exampleUtterances}) => {
  return (
    <div class="">
      <div class="">
        Icon
      </div>
      <div class="category-label">
        {categoryLabel}
      </div>
      <div class="example-utterance-wrapper">
        <ul>
          {
            exampleUtterances.map((example) => 
              <li>"{example}"</li>
            )
          }
        </ul>
      </div>
    </div>
  );
};

// const SearchAndNavigate = () => {
//   return (

//   );
// };

// const Music = () => {
//   return (

//   );
// };

// const BrowserControls = () => {
//   return (

//   );
// };

const OpenVoiceEcosystem = () => {
  return (
    <div class="mzp-l-content mzp-l-card-half">
      <div class="mzp-c-card">
        <h6>An open voice ecosystem</h6>
        <div>
          <p>At Mozilla we’re trying to build an open voice ecosystem that is both private and secure. To do this, we’ve developed tools such as <a href="https://voice.mozilla.org/">Common Voice</a> to collect the necessary data to teach our systems how to recognize a wider variety of diverse voices, in all sorts of environments.</p>

          <p>Now you can help by choosing to let us store your Firefox Voice requests&mdash;securely, without accompanying personally identifiable information&mdash;and use them to improve our research. We won't share them outside of Mozilla.</p>
        </div>
      </div>

      <div class="mzp-c-card">
        Common Voice Guy goes here
      </div>
    </div>
  );
};

const Demo = () => {
  return (
    <div class="mzp-l-content mzp-l-card-half">
      <div class="mzp-c-card">
        DEMO VIDEO
      </div>

      <div class="mzp-c-card">
        <h6>See how it works</h6>
        <div>
          Whether you need to maintain your focus or just have your hands full, now you can go hands-free to navigate the web and retrieve information instantly.

          <div><a href="">Watch the video</a></div>
        </div>
      </div>
    </div>
  );
};

const Faq = () => {
  return (
    <div class="mzp-l-content">
      <h5>Frequently asked questions</h5>
      <section>
        <details>
          <summary>
            <div class="faq-section-header">What is Firefox Voice?</div>
          </summary>
          <p>
            Firefox Voice is an experimental Add-On for the Firefox Browser that enables voice interactions. You can ask things like “Search for sushi in Auckland”, “Close tab” or “How tall is Mount Everest?”
          </p>

          <p>
            Currently, Firefox Voice is available for the Desktop browsers, only supports English, and requires a user to <a href="https://events.mozilla.org/firefoxvoicecampaign">manually download and install the Add-on from the campaign page</a>, grant permission for microphone access, and trigger the microphone to listen by clicking on an icon in the toolbar or using a keyboard shortcut.
          </p>
        </details>
        <details>
          <summary>
          <div class="faq-section-header">When is the microphone active and listening?</div>
          </summary>
          <p>
            The microphone for Firefox Voice is only active when triggered with a button press or keyboard shortcut. We strive to make it clear anytime Firefox Voice is listening as privacy and trust are central to Firefox Voice and Mozilla.
          </p>

          <p>
            The microphone access is paused between use, so you may notice an operating system indicator that Firefox is retaining the microphone.
          </p>
        </details>
        <details>
          <summary>
          <div class="faq-section-header">Are my audio recordings stored?</div>
          </summary>
          <p>
            By default Firefox Voice does <strong>not</strong> store your voice recordings after processing. Users may enable audio recordings to be stored for purposes of improving our speech detection service but it is not required or enabled by default, nor are we promoting this option currently.
          </p>
        </details>
        <details>
          <summary>
          <div class="faq-section-header">Are my voice recordings transcribed and stored?</div>
          </summary>
          <p>
            For the initial Beta release we ask participants to allow transcriptions during the installation process. Even if participants opt-out of allowing transcriptions they are able to use Firefox Voice.
          </p>
          <p>
            When participants opt-in, transcripts are used for research purposes to improve Firefox Voice and related services. Transcriptions and related data are stored securely and without personally identifying information.
          </p>
          <p>
            In the Preferences you can additionally allow us to keep your audio for speech-to-text training purposes. This is off by default.
          </p>
        </details>
        <details>
          <summary>
          <div class="faq-section-header">When will this automatically be included into Firefox?</div>
          </summary>
          <p>
            The current Beta release of Firefox Voice is an experiment to better understand the needs and desire for voice interactions within the browser. At this time no decision has been made on when or if the add-on will come bundled by default with Firefox. Future development depends on feedback and performance of the Add-On.
          </p>
        </details>
        <details>
          <summary>
          <div class="faq-section-header">What other voice experiments is Mozilla working on?</div>
          </summary>
          <p>
            Mozilla is experimenting with voice in a number projects including:
          </p>
          <ul>
            <li>
              <a href="https://voice.mozilla.org/">Common Voice</a>: A crowdsourcing project to create a free database for speech recognition software. The project is supported by volunteers who record sample sentences with a microphone and review recordings of other users.
            </li>
            <li>
              <a href="https://github.com/mozilla/TTS">Mozilla TTS</a>: A deep learning based Text2Speech engine, low in cost and high in quality.
            </li>
            <li>
              <a href="https://github.com/mozilla/DeepSpeech">Project DeepSpeech</a>: An open source Speech-To-Text engine, using a model trained by machine learning techniques.
            </li>
          </ul>
        </details>
        <details>
          <summary>
          <div class="faq-section-header">How is my audio processed?</div>
          </summary>
          <p>
            When you make a request using Firefox Voice, the browser captures the audio and uses cloud-based services to transcribe and then process the request. Below are the steps and services utilized.
          </p>
          <ol>
            <li>
              The microphone must be opened with a button press or keyboard shortcut.
            </li>
            <li>
              After you finish speaking the microphone is turned off.
            </li>
            <li>
              Audio from your voice request is sent to Mozilla’s Voicefill server without any personally identifiable metadata.
            </li>
            <li>
              Voicefill sends the audio to Google’s Speech-to-Text engine, which returns transcribed text. We’ve instructed the Google Speech-to-Text engine to NOT save any recordings. Note: In the future, we expect to enable Mozilla’s own technology for Speech-to-Text which enables us to stop using Google’s Speech-to-Text engine.
            </li>
            <li>
              <div>Based on the transcribed text, Firefox Voice attempts to fulfill your request.</div>
              <ul>
                <li>
                  For example, if you say “Go to…” or “Find…” a Search using your default search engine will be executed. Note: if you’re using Google Search and are logged into your Google account in Firefox, your search will be associated with your Google search history.
                </li>
                <li>
                  Requests such as “Close tab” or “Read this page” are processed directly by the browser.
                </li>
              </ul>
            </li>
            <li>
              We’ve instructed Google Speech-to-text not to retain audio once the request has been processed. In addition, Mozilla does not retain any audio unless you’ve actively chosen to allow Mozilla to collect audio recordings for the purpose of improving our speech recognition service.
            </li>
          </ol>
        </details>
      </section>
    </div>
  );
};

const Footer = () => {
  return (
    <footer class="mzp-c-footer">
      <div class="mzp-l-content">
      <nav class="mzp-c-footer-primary">
        <div class="mzp-c-footer-primary-logo"><a href="https://www.mozilla.org/">Mozilla</a></div>
          <div class="mzp-c-footer-legal">
            <p class="mzp-c-footer-license">
              Portions of this content are ©1998–2018 by individual mozilla.org
              contributors. Content available under a <a rel="license" href="https://www.mozilla.org/foundation/licensing/website-content/">Creative Commons license</a>.
            </p>
            <ul class="mzp-c-footer-terms">
              <li><a href="https://www.mozilla.org/privacy/websites/">Website Privacy Notice</a></li>
              <li><a href="https://www.mozilla.org/privacy/websites/#cookies">Cookies</a></li>
              <li><a href="https://www.mozilla.org/about/legal/">Legal</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </footer>
  );
};
