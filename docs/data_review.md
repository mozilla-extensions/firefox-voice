# Data Review Form 

Instructions: Data Stewards will review a request for data collection and endorse responses to each question. 
**If the request does not provide answers to questions, reviewers give an r- and point to the questions that can’t be answered.**

1) Is there or will there be **documentation** that describes the schema for the ultimate data set in a public, complete, and accurate way? 

Yes: Schema is available here (link to be updated after PR is merged): https://github.com/mozilla-services/mozilla-pipeline-schemas/pull/381

2) Is there a control mechanism that allows the user to turn the data collection on and off? 
For the initial internal alpha, there will not be a mechanism for turning off data collection. We will ensure that we are transparent with what data is being collected for consent purposes for our internal alpha testers BEFORE they download/install our add-on.

A data collection control will be added in Settings before we release publically. 

3) If the request is for permanent data collection, is there someone who will monitor the data over time?
Ian Bicking and @harraton will be monitoring the data. 

4) Using the **[category system of data types](https://wiki.mozilla.org/Firefox/Data_Collection)** on the Mozilla wiki, what collection type of data do the requested measurements fall under?
Category 3.

5) Is the data collection request for default-on or default-off?
For the internal alpha, the request is for default-on. 

6) Does the instrumentation include the addition of **any *new* identifiers** (whether anonymous or otherwise; e.g., username, random IDs, etc.  See the appendix for more details)?
No new identifiers are being created. 

7) Is the data collection covered by the existing Firefox privacy notice? 


8) Does there need to be a check-in in the future to determine whether to renew the data? (Yes/No) (If yes, set a todo reminder or file a bug if appropriate)**

Yes, in 6 months. 

9) Does the data collection use a third-party collection tool? 
No
