# Voice Fill Metrics
The metrics collection and analysis plan for Voice Fill, a forthcoming Test Pilot experiment.

## Definitions
- **Session** - an atomic unit of interaction with Voice Fill, containing 1 or more attempts. Begins when the user initiates recording, and ends when either 1) the user submits that form, or 2) the user exits the session without accepting a Voice Fill suggestion.
- **Attempt** – the subset of a session between when a user initiates recording and either 1) accepts or rejects the suggestions, or 2) cancels the session. If the attempt is not cancelled before receiving a response from the speech-to-text service, an attempt will contain 0 or more suggestions.
- **Suggestion** – a single suggested string of text, as returned from the speech-to-text engine. Has a paired confidence level.

## Analysis
Data collected by Voice Fill will be used to answer the following high-level questions:

- Is the Voice Fill experience compelling?
	- How often do users reject suggestions and try again?
	- How often do users accept and modify suggestions?
	- What are users’ tolerance for inaccuracy?
- Where do users use Voice Fill?
	- In what contexts are they most likely to initiate?
	- What methods do users use to initiate?
	- Might users be better-served by different or additional controls?
- What is the value in showing more than one result?
	- Is the most-confident suggestion sufficiently accurate?

## Collection
Data will be collected with Google Analytics and follow [Test Pilot standards](https://github.com/mozilla/testpilot/blob/master/docs/experiments/ga.md) for reporting. Voice Fill sessions will be marked by [Google Analytics sessions](https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#session), beginning and ending according to the definition above.

### Custom Metrics
- `cm1` - the number of attempts made in a session.
- `cm2` - the confidence level of the accepted suggestion, if one was accepted; otherwise omitted. Integer between `1` and `100`, inclusive.
- `cm3` - the index of an accepted suggestion, if one was accepted; otherwise omitted.
- `cm4` - the elapsed time in ms spent recording an attempt.
- `cm5` - the elapsed time in ms waiting for a response from the speech-to-text engine.

### Custom Dimensions
- `cd1` - the outcome of a session or attempt. One of `accepted`, `rejected`, and `aborted`.
- `cd2` - the location from which a session is initiated. One of `google`, `duckduckgo`, `Yahoo`, `generic`.
- `cd3` - the UI element from which the session was initiated. One of `button`, `context menu`, `keyboard`.
- `cd4` - whether the accepted submission was modified before being submitted. One of `true`, `false`.
- `cd5` - whether the user viewed additional suggestions.

### Events

#### `session`
Triggered when a session ends. Includes:

- `ec` - `voice fill`
- `ea` - `session`
- `sc` - `end`
- `cm1`
- `cm2`
- `cm3`
- `cm4` (for the attempt from which a suggestion was accepted, if a suggestion was accepted; otherwise omitted)
- `cm5` (for the attempt from which a suggestion was accepted, if a suggestion was accepted; otherwise omitted)
- `cd1` (for the session)
- `cd2`
- `cd3`
- `cd4` (for the attempt from which a suggestion was accepted, if a suggestion was accepted; otherwise omitted)

#### `attempt`
Triggered whenever an attempt is acted upon. Includes:

- `ec` - `voice fill`
- `ea` - `attempt`
- `cm2`
- `cm3`
- `cm4`
- `cm5`
- `cd1` (for this attempt)
- `cd5`
