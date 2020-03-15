
# Request for data collection review form

**All questions are mandatory. You must receive review from a data steward peer on your responses to these questions before shipping new data collection.**

1) What questions will you answer with this data?

Determine level of engagement to inform product direction, feature priorities, release audience.
* General usage levels as measured by daily & monthly active users
* Type of requests/actions
* General retention (do people keep using it)
* Add-on installation retention (do people keep it installed)

Quantify revenue potential
* By search volume (Google, Amazon, etc)

Identify barriers to usage
* Error messages
* Unhandled intents
* Intents that appear to have been incorrect (if we can figure out an indication, maybe when a created tab is very quickly closed?)
* Intents that were not able to be completed. E.g., switch-to-tab can’t find the tab.

Determine target audience
* General user data (geography, add-ons installed, Firefox usage)

If we allow other add-ons to extend functionality, how many such add-ons does a user have, and do they use them? Which add-ons specifically?

Preferred interaction
* Keyboard shortcut vs toolbar button
* Speaking vs typing (if/when that is implemented)

Latency (How long does it take to get a result back?)

Mobile vs. desktop use for those who have an Android

2) Why does Mozilla need to answer these questions?  Are there benefits for users? Do we need this information to address product or business requirements? Some example responses:

* Understand the viability of Firefox Voice as a feature for Firefox. 

* The benefit to users: Firefox Voice allows people to control the browser with their voice, and increases efficiency with getting certain tasks done. E.g. "Play the song High Hopes on YouTube." This becomes one request, rather than one that involves several steps or clicks. 

* To define the revenue potential for this feature.

3) What alternative methods did you consider to answer these questions? Why were they not sufficient?

* We will conduct user studies, but that will not give us the same scope of information and learnings as the telemetry data, since the telemetry data will provide insight on all usage. 

4) Can current instrumentation answer these questions?

* No, but we will be able to utilitze existing telemetry around environmental variables (version of Firefox) to supplement the new data we will start to collect. 

5) List all proposed measurements and indicate the category of data collection for each measurement, using the Firefox [data collection categories](https://wiki.mozilla.org/Firefox/Data_Collection) on the Mozilla wiki.   

**Note that the data steward reviewing your request will characterize your data collection based on the highest (and most sensitive) category.**

<table>
  <tr>
    <td>Measurement Description</td>
    <td>Data Collection Category</td>
    <td>Tracking Bug #</td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</table>


6) How long will this data be collected?  Choose one of the following:

* I want this data to be collected for 6 months initially (potentially renewable) for the alpha deployment of the add-on.

7) What populations will you measure?

* All release channels, countries, and languages. 

8) If this data collection is default on, what is the opt-out mechanism for users?

* To opt-out, people will be able to uninstall the add-on. 

9) Please provide a general description of how you will analyze this data.

* We will use histograms, graphs, and conduct statistical analysis to answer our questions (described in question 1). 

10) Where do you intend to share the results of your analysis?

* We will have an internal dashboard, and may write up aggregate results for use in marketing, technical reports, academic papers, and/or internal and external presentations. 

11) Is there a third-party tool (i.e. not Telemetry) that you are proposing to use for this data collection? 

* No. 
