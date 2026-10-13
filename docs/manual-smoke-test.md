# Manual Smoke Test - Chrome and Edge

## Purpose

Validate Phase 2 baseline behavior for the unpacked extension build.

## Test Environment

- Chrome stable (latest)
- Edge stable (latest)
- Fresh browser profile preferred
- Extension loaded unpacked from `extension/`

## Setup

1. Open extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
2. Enable Developer Mode.
3. Click "Load unpacked" and select `extension/`.
4. Pin extension action button.

## Smoke Cases

### 1) Install and startup

- Expect extension installs without manifest errors.
- Open popup; expect status text to load.

Pass criteria:

- Popup opens.
- No runtime errors shown on extension card.

### 2) Global ON/OFF toggle

- In popup, switch blocking OFF.
- Confirm status shows OFF.
- Switch blocking ON.
- Confirm status shows ON (aggressive).

Pass criteria:

- Toggle state updates immediately and persists after popup reopen.

### 3) Pause 10 minutes

- Click "Pause 10 min".
- Confirm countdown appears.
- Wait at least 10-15 seconds and confirm countdown decreases.

Pass criteria:

- Paused state is visible with countdown.
- "Pause 10 min" disabled while paused.
- "Resume now" enabled while paused.

### 4) Resume now

- While paused, click "Resume now".
- Confirm state returns to ON (aggressive).

Pass criteria:

- Paused state clears immediately.
- Controls swap back correctly.

### 5) Auto resume after timeout

- Click "Pause 10 min" and let it expire naturally.
- Reopen popup after expiry.

Pass criteria:

- Blocking auto-resumes when timer expires.

### 6) Rule update alarm presence

- On extensions page, open service worker inspection.
- In console, run:

```js
chrome.alarms.get("ruleUpdateCheck").then(console.log)
```

Pass criteria:

- Alarm exists with ~360 minute period.

### 7) Basic blocking sanity check

- Visit pages that load known blocked domains from bundled rules.
- Reopen popup and observe blocked counters.

Pass criteria:

- Counters increase on blocked requests (environment-dependent due to debug API constraints).

## Browser-Specific Notes

- If blocked counters do not increment in a store-like environment, this is expected due to `declarativeNetRequestFeedback` restrictions.
- Core block behavior still depends on DNR ruleset enable/disable state.

## Result Template

- Browser: Chrome/Edge
- Date:
- Tester:
- Case 1: Pass/Fail
- Case 2: Pass/Fail
- Case 3: Pass/Fail
- Case 4: Pass/Fail
- Case 5: Pass/Fail
- Case 6: Pass/Fail
- Case 7: Pass/Fail
- Notes:
