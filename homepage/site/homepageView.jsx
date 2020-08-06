/* eslint-disable no-unused-vars */
/* globals React, Mzp */

const { useState } = React;

export const Homepage = ({ isCommonVoice }) => {
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 300) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 300) {
      setShowScroll(false);
    }
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.addEventListener("scroll", checkScrollTop);

  return (
    <div id="homepage-wrapper">
      <React.Fragment>
        <button
          className="scroll-top"
          onClick={scrollTop}
          style={{ height: "3rem", display: showScroll ? "flex" : "none" }}
        >
          <img alt="Scroll top" src="./images/arrow-up.png" />
        </button>
        <Header />
        {isCommonVoice && <CommonVoiceWelcome />}
        <HomepagePageContent />
        <Footer />
      </React.Fragment>
    </div>
  );
};

const CommonVoiceWelcome = () => {
  const handleCommonVoiceClick = e => {
    e.preventDefault();
    const content = document.querySelector(".modal-common-voice-content");
    Mzp.Modal.createModal(e.target, content, {
      title: "Contribute your voice",
      className: "cv-modal",
      closeText: "Close modal",
    });
  };

  const handleDismissCommonVoice = e => {
    e.preventDefault();
    e.currentTarget.parentNode.remove();
  };

  return (
    <React.Fragment>
      <aside class="mzp-c-notification-bar common-voice-welcome">
        <button
          onClick={handleDismissCommonVoice}
          class="mzp-c-notification-bar-button"
          type="button"
        ></button>
        <img
          class="robot-profile"
          alt="Profile of the Common Voice robot illustration"
          src="./images/robot-profile.svg"
        />
        <p>
          Welcome Common Voice contributor! Help us build an open voice
          ecosystem. After installing, please allow Firefox Voice to collect
          voice samples.{" "}
          <button
            onClick={handleCommonVoiceClick}
            class="modal-button common-voice"
          >
            Learn more
          </button>
          .
        </p>
      </aside>
      <div class="mzp-u-modal-content modal-common-voice-content">
        <div class="common-voice-content-wrapper">
          <div class="common-voice-content">
            <img
              src="./images/common-voice-wave.jpg"
              alt="Illustration of audio waves"
            />
            <div class="common-voice-copy">
              <p>
                At Mozilla we’re working to build an open voice ecosystem that
                is both private and secure. To do this, we’ve developed tools
                like <a href="https://voice.mozilla.org/">Common Voice</a> to
                collect the necessary data needed to teach our systems how to
                recognize a wider variety of voices, in all sorts of
                environments.
              </p>

              <p>
                Now we’re asking for your help training{" "}
                <a href="https://github.com/mozilla/DeepSpeech">
                  Mozilla’s DeepSpeech
                </a>{" "}
                system for the words and phrases people say when browsing the
                internet.
              </p>

              <p>
                You can contribute tremendously to the improvement of DeepSpeech
                just by using Firefox Voice for common tasks — such as search,
                navigation, playing music and allowing Mozilla to collect and
                store samples.
              </p>

              <p>
                All voice samples are stored securely and without accompanying
                personally identifiable information.
              </p>
            </div>
            <div class="common-voice-cta">
              <a
                class="mzp-c-button mzp-t-product install-cta"
                href="https://va.allizom.org/releases/prod/firefox-voice.xpi"
              >
                Install Firefox Voice
              </a>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const Header = () => {
  return (
    <div class="mzp-c-navigation">
      <div class="mzp-c-navigation-l-content">
        <div class="mzp-c-navigation-container">
          <button
            class="mzp-c-navigation-menu-button"
            type="button"
            aria-controls="navigation-demo"
          >
            Menu
          </button>
          <div class="mzp-c-navigation-logo">
            <img
              src="./images/fx-voice-logo.svg"
              alt="Firefox Voice logo"
            ></img>
          </div>
          <div class="mzp-c-navigation-items">
            <div class="mzp-c-navigation-menu">
              <nav class="mzp-c-menu mzp-is-basic">
                <ul class="mzp-c-menu-category-list">
                  <li class="mzp-c-menu-category">
                    <a class="mzp-c-menu-title" href="#how-it-works">
                      How it works
                    </a>
                  </li>
                  <li class="mzp-c-menu-category">
                    <a class="mzp-c-menu-title" href="#faq">
                      FAQs
                    </a>
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
          <h1 class="mzp-c-hero-title mzp-has-zap-17">
            Browse the web with <strong>your&nbsp;voice</strong>
          </h1>

          <div class="mzp-c-hero-desc">
            <p>
              Firefox Voice lets you browse and get more done&mdash;faster than
              ever. Simply install the browser add-on, then command the entire
              internet with just your voice.
            </p>
          </div>

          <p class="mzp-c-hero-cta">
            <a
              class="mzp-c-button mzp-t-product install-cta"
              href="https://va.allizom.org/releases/prod/firefox-voice.xpi"
            >
              Install Firefox Voice
            </a>
            <div class="mzp-c-availability">
              Available as an extension for Firefox on desktop / laptop. Requires a working microphone.
              <br />
              Currently available in English only.
            </div>
          </p>
        </div>
      </div>
    </section>
  );
};

const ExampleActions = () => {
  return (
    <div class="mzp-l-content">
      <section class="mzp-c-emphasis-box box-purple">
        <h6 class="things-you-can-do">Things you can do</h6>

        <div class="action-categories">
          <ActionCategory
            icon={"search"}
            categoryLabel={"Search & Navigate"}
            exampleUtterances={[
              "Go to The New York Times",
              "Search legos on Amazon",
              "Show me the Warriors schedule",
              "Search my Google Docs for team meeting notes",
            ]}
          />

          <ActionCategory
            icon={"music"}
            categoryLabel={"Play Music"}
            exampleUtterances={[
              "Play Jazz on Spotify",
              "Play Green Day on YouTube",
              "Pause",
              "Next",
            ]}
          />

          <ActionCategory
            icon={"browser"}
            categoryLabel={"Browser Controls"}
            exampleUtterances={[
              "Find my calendar tab",
              "Scroll down",
              "Print",
              "Reload this page",
              "Screenshot",
            ]}
          />
        </div>

        <div class="see-all-actions">
          <a href="https://mozilla-extensions.github.io/firefox-voice/lexicon.html">
            Everything you can say
          </a>
        </div>
      </section>
    </div>
  );
};

const ActionCategory = ({ icon, categoryLabel, exampleUtterances }) => {
  return (
    <div class="action-category">
      <div class="action-logo">
        <img src={"./images/" + icon + ".svg"} alt={icon + " icon"} />
      </div>
      <div class="category-label">{categoryLabel}</div>
      <div class="example-utterance-wrapper">
        <ul>
          {exampleUtterances.map(example => (
            <li>&ldquo;{example}&rdquo;</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const OpenVoiceEcosystem = () => {
  return (
    <div class="mzp-l-content mzp-l-card-half">
      <div class="mzp-l-flexcards wrap-reverse">
        <div class="mzp-c-card">
          <h6 class="card-header mzp-has-zap-14 open-voice-ecosystem">
            An <strong>open&nbsp;voice</strong> ecosystem
          </h6>
          <div>
            <p>
              At Mozilla we’re trying to build an open voice ecosystem that is
              both private and secure. To do this, we’ve developed tools such as{" "}
              <a href="https://voice.mozilla.org/">Common Voice</a> to collect
              the necessary data to teach our systems how to recognize a wider
              variety of diverse voices, in all sorts of environments.
            </p>

            <p>
              Now you can help by choosing to let us store your Firefox Voice
              requests&mdash;securely, without accompanying personally
              identifiable information&mdash;and use them to improve our
              research.
            </p>
          </div>
        </div>

        <div class="mzp-c-card">
          <img
            class="common-voice-robot"
            alt="Illustration of Mars, the Common Voice robot logo"
            src="./images/common-voice-robot.png"
          />
        </div>
      </div>
    </div>
  );
};

const Demo = () => {
  const handleVideoClick = e => {
    e.preventDefault();
    const content = document.querySelector(".modal-video-content");
    Mzp.Modal.createModal(e.target, content, {
      title: "Firefox Voice Demo Video",
      className: "mzp-has-media",
      closeText: "Close modal",
    });
  };
  return (
    <div id="how-it-works" class="mzp-l-content mzp-l-card-half">
      <div class="mzp-l-flexcards">
        <div class="mzp-c-card">
          <div class="video-wrapper">
            <div class="play-video">
              <div class="play-btn-wrapper">
                <button onClick={handleVideoClick} name="play"></button>
              </div>
              <img
                alt="Still frame from the demo video with a play icon overlay. The still shows the outcome of the Firefox Voice command: 'Read this page to me', where a New York Times article is being narrated in the browser's reader view."
                src="./images/demo-still.png"
              />
            </div>
          </div>
        </div>

        <div class="mzp-c-card how-it-works-card">
          <h6 class="card-header mzp-has-zap-11">
            See how it <strong>works</strong>
          </h6>
          <div>
            Whether you need to maintain your focus or just have your hands
            full, now you can go hands-free to navigate the web and retrieve
            information instantly.
            <div class="watch-video">
              <button onClick={handleVideoClick} class="video modal-button">
                Watch the video
              </button>
            </div>
            <div class="mzp-u-modal-content modal-video-content">
              <div class="video-wrapper">
                <iframe
                  title="Firefox Voice Demo Video"
                  src="https://www.youtube.com/embed/3sqKsfj8WRE"
                  frameborder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Faq = () => {
  return (
    <div id="faq" class="mzp-l-content mzp-l-core">
      <h5 class="mzp-has-zap-17 faq-title">
        <strong>Frequently&nbsp;asked&nbsp;questions</strong>
      </h5>
      <section class="faq">
        <details>
          <summary>
            <div class="faq-section-header">What is Firefox Voice?</div>
          </summary>
          <p>
            Firefox Voice is an experimental Add-On for the Firefox Browser that
            enables voice interactions. You can ask things like “Search for
            sushi in Auckland”, “Close tab” or “How tall is Mount Everest?”
          </p>

          <p>
            Currently, Firefox Voice is available for the desktop browser, only
            supports English, and requires a user to manually{" "}
            <a href="https://va.allizom.org/releases/prod/firefox-voice.xpi">
              download and install the Add-on
            </a>
            , grant permission for microphone access, and trigger the microphone
            to listen by clicking on an icon in the toolbar or using a keyboard
            shortcut.
          </p>
        </details>
        <details>
          <summary>
            <div class="faq-section-header">
              When is the microphone active and listening?
            </div>
          </summary>
          <p>
            The microphone for Firefox Voice is only active when triggered with
            a button press or keyboard shortcut. We strive to make it clear
            anytime Firefox Voice is listening as privacy and trust are central
            to Firefox Voice and Mozilla.
          </p>

          <p>
            The microphone access is paused between use, so you may notice an
            operating system indicator that Firefox is retaining the microphone.
          </p>
        </details>
        <details>
          <summary>
            <div class="faq-section-header">
              Are my audio recordings stored?
            </div>
          </summary>
          <p>By default Firefox Voice does not store voice recordings.</p>
          <p>
            Users may allow Mozilla to store their voice recordings and
            computer-generated transcripts of their recordings. Recordings and
            transcripts are stored securely and without personally identifying
            information (this means, we don’t know who said them).
          </p>
          <p>
            Even if users do not opt-in to allowing storage, they are able to
            use Firefox Voice.
          </p>
          <p>In your Preferences,you can change your settings at any time.</p>
          <p>
            If you allow Mozilla to store your voice recordings, we use your
            recordings for research purposes and to help improve Firefox Voice.
            For example, we may use the computer-generated transcripts of your
            recordings to help identify which commands we should support. We may
            also manually review your voice recordings to better train our
            speech service to respond more accurately.
          </p>
        </details>
        <details>
          <summary>
            <div class="faq-section-header">
              Why does Firefox Voice ask for all these permissions?
            </div>
          </summary>
          <p>
            Because you can use Firefox Voice to execute a wide variety of
            commands, it first needs permissions to many of those things on your
            behalf.
          </p>
          <dl>
            <dt>Access your data for all websites</dt>
            <dd>
              This permission allows you to use Firefox Voice to control
              websites to do things like scroll, copy and paste, find a tab and
              more.
              <br />
              <br />
              While this permission would make it <em>possible</em> to extract
              user information from a website, it does not do so. Our{" "}
              <a href="https://mozilla-extensions.github.io/firefox-voice/privacy-policy.html">
                Privacy Policy
              </a>{" "}
              specifies what information we collect (set during installation or
              later in the preferences). It does NOT include any browsing or
              site information.
            </dd>
            <dt>Read and modify bookmarks</dt>
            <dd>
              This is used for commands that open, create, and delete bookmarks.
            </dd>
            <dt>Read and modify browser settings</dt>
            <dd>
              Used to open your preferred homepage set in the browser setting.
            </dd>
            <dt>Get data from the clipboard</dt>
            <dd>Used to enable voice control for "paste".</dd>
            <dt>Input data to the clipboard</dt>
            <dd>
              Used to enable voice commands for “copy” such as "copy link".
            </dd>
            <dt>
              Download files and read and modify the browser’s download history
            </dt>
            <dd>
              Used for commands such as "save page" and "save screenshot" that
              download files.
            </dd>
            <dt>Read the text of all open tabs</dt>
            <dd>Used for the command "find [query] in page".</dd>
            <dt>Access browsing history</dt>
            <dd>
              Used to determine your preferred music service. E.g., if you visit
              <code>spotify.com</code> often/recently, it is presumed to be your
              preferred service.
            </dd>
            <dt>Hide and show browser tabs</dt>
            <dd>
              Firefox Voice executes searches in the background, sometimes
              taking you directly to search results or cards. We use a "hidden"
              tab to do this, so these automatically-created search tabs do not
              clutter your normal tab layout.
            </dd>
            <dt>Access browser tabs</dt>
            <dd>Used for finding and managing your tabs.</dd>
          </dl>
        </details>
        <details>
          <summary>
            <div class="faq-section-header">
              When will this automatically be included into Firefox?
            </div>
          </summary>
          <p>
            The current release of Firefox Voice is an experiment to better
            understand the needs and desire for voice interactions within the
            browser. At this time no decision has been made on when or if the
            add-on will come bundled by default with Firefox. Future development
            depends on feedback and performance of the Add-On.
          </p>
        </details>
        <details>
          <summary>
            <div class="faq-section-header">
              What other voice experiments is Mozilla working on?
            </div>
          </summary>
          <p>
            Mozilla is experimenting with voice in a number projects including:
          </p>
          <ul>
            <li>
              <a href="https://voice.mozilla.org/">Common Voice</a>: A
              crowdsourcing project to create a free database for speech
              recognition software. The project is supported by volunteers who
              record sample sentences with a microphone and review recordings of
              other users.
            </li>
            <li>
              <a href="https://github.com/mozilla/TTS">Mozilla TTS</a>: A deep
              learning based text-to-speech engine, low in cost and high in
              quality.
            </li>
            <li>
              <a href="https://github.com/mozilla/DeepSpeech">
                Project DeepSpeech
              </a>
              : An open source Speech-To-Text engine, using a model trained by
              machine learning techniques.
            </li>
          </ul>
        </details>
        <details>
          <summary>
            <div class="faq-section-header">How is my audio processed?</div>
          </summary>
          <p>
            When you make a request using Firefox Voice, the browser captures
            the audio and uses cloud-based services to transcribe and then
            process the request. Below are the steps and services utilized.
          </p>
          <ol>
            <li>
              The microphone must be opened with a button press or keyboard
              shortcut.
            </li>
            <li>After you finish speaking the microphone is turned off.</li>
            <li>
              Audio from your voice request is sent to Mozilla’s Voicefill
              server without any personally identifiable metadata.
            </li>
            <li>
              Voicefill sends the audio to Google’s Speech-to-Text engine, which
              returns transcribed text. We’ve instructed the Google
              Speech-to-Text engine to NOT save any recordings. Note: In the
              future, we expect to enable Mozilla’s own technology for
              Speech-to-Text which enables us to stop using Google’s
              Speech-to-Text engine.
            </li>
            <li>
              <div>
                Based on the transcribed text, Firefox Voice attempts to fulfill
                your request.
              </div>
              <ul>
                <li>
                  For example, if you say “Go to…” or “Find…” a Search using
                  your default search engine will be executed. Note: if you’re
                  using Google Search and are logged into your Google account in
                  Firefox, your search will be associated with your Google
                  search history.
                </li>
                <li>
                  Requests such as “Close tab” or “Read this page” are processed
                  directly by the browser.
                </li>
              </ul>
            </li>
            <li>
              We’ve instructed Google Speech-to-text not to retain audio once
              the request has been processed. In addition, Mozilla does not
              retain any audio unless you’ve actively chosen to allow Mozilla to
              collect audio recordings for the purpose of improving our speech
              recognition service.
            </li>
          </ol>
        </details>
        <details>
          <summary>
            <div class="faq-section-header">
              When I try to install I see “the add-on could not be downloaded
              because of a connection failure.”
            </div>
          </summary>
          <p>
            Antivirus and other security software can sometimes prevent Firefox
            extensions from being downloaded, installed or updated.
          </p>
          <img
            class="connection-error"
            src="./images/connection-error.png"
            alt="Tooltip dialog window showing an error message upon installing the add-on. The message reads: 'The add-on could not be downloaded
              because of a connection failure.'"
          />
          <p>
            If you’re having trouble installing Firefox Voice or it doesn’t
            update automatically, follow these steps to install the extension
            manually:
          </p>
          <ol>
            <li>
              Open a different browser, like Safari, Chrome, or Microsoft Edge.
            </li>
            <li>
              Copy and paste the{" "}
              <a href="https://va.allizom.org/releases/prod/firefox-voice.xpi">
                download
              </a>{" "}
              link into the different browser. It will be saved as a .xpi file
              in your Downloads folder.
            </li>
            <li>
              Open Firefox and drag the .xpi file to the Firefox window, then
              click Add.
            </li>
          </ol>
        </details>
        <details>
          <summary>
            <div class="faq-section-header">
              After installing Firefox Voice it doesn’t respond to anything I
              say.
            </div>
          </summary>
          <p>
            If you’re having trouble getting Firefox Voice to hear what you're
            saying and take action the microphone may not be picking up audio.
            Check that your microphone is set up correctly.
          </p>
          <ol>
            <li>
              Ensure your device has a microphone or your external microphone is
              plugged in.
            </li>
            <li>Check Firefox Voice has permissions to access the mic.</li>
            <li>Restart Firefox. This can often clear up the issue.</li>
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
          <div class="mzp-c-footer-primary-logo">
            <a href="https://www.mozilla.org/">Mozilla</a>
          </div>

          <div class="mzp-c-footer-items">
            <div class="mzp-c-footer-item">
              <a
                href="https://docs.google.com/document/d/1nTyIw4G1yWnxlTmJ-Nvs9OIDntAIYmRPMLKVJZ9TxkI/edit"
                target="_blank"
              >
                Installation Instructions
              </a>
            </div>
            <div class="mzp-c-footer-item">
              <a href="https://github.com/mozilla/firefox-voice/">GitHub</a>
            </div>
            <div class="mzp-c-footer-item">
              <a href="https://firefox-voice-feedback.herokuapp.com/">
                Feedback
              </a>
            </div>
            <div class="mzp-c-footer-item">
              <a href="https://mozilla-extensions.github.io/firefox-voice/privacy-policy.html">
                Privacy
              </a>
            </div>
          </div>
        </nav>

        <nav class="mzp-c-footer-secondary">
          <div class="mzp-c-footer-legal">
            <p class="mzp-c-footer-license">
              Visit Mozilla Corporation’s not-for-profit parent, the{" "}
              <a href="https://foundation.mozilla.org/">Mozilla Foundation</a>.
              <br /> Portions of this content are ©1998–2020 by individual
              mozilla.org contributors. Content available under a{" "}
              <a
                rel="license"
                href="https://www.mozilla.org/foundation/licensing/website-content/"
              >
                Creative Commons license
              </a>
              .
            </p>
          </div>
        </nav>
      </div>
    </footer>
  );
};
