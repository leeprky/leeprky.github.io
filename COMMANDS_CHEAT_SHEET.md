# Drunk Uno — Commands & Run Sheet for Tomorrow

Quick-reference commands for local development, testing, git deployment, and multiplayer broker synchronization.

---

### 1. Git Workflow & Deployment (GitHub Pages)

Always work on `dev`, then merge into `main` for instant GitHub Pages deployment:

```bash
# Check current changes
cd /home/leeparky04/Projects/leeprky.github.io
git status
git diff

# Commit changes on dev
git add projects/drunk-uno/index.html
git commit -m "feat(drunk-uno): update feature description"
git push origin dev

# Merge dev into main and push to GitHub Pages
git checkout main
git merge dev
git push origin main
git checkout dev
```

---

### 2. Syntax & Validation Test

Run this one-liner before pushing to ensure all inline JavaScript scripts have 0 syntax errors:

```bash
node -e '
const fs = require("fs");
const html = fs.readFileSync("/home/leeparky04/Projects/leeprky.github.io/projects/drunk-uno/index.html", "utf8");
const scriptMatches = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
console.log("Found inline scripts:", scriptMatches.length);
for (let i = 0; i < scriptMatches.length; i++) {
  try {
    new Function(scriptMatches[i][1]);
    console.log(`Script ${i + 1}: Syntax OK`);
  } catch (e) {
    console.error(`Script ${i + 1} syntax error:`, e);
    process.exit(1);
  }
}
'
```

---

### 3. Local Development Preview

Serve locally to test on desktop browser or mobile via local IP / Wi-Fi:

```bash
# Start local python HTTP server on port 8080
cd /home/leeparky04/Projects/leeprky.github.io
python3 -m http.server 8080

# Open in browser:
# http://localhost:8080/projects/drunk-uno/
```

---

### 4. Live Multi-Phone MQTT Architecture Details

- **Broker**: Public HiveMQ WebSocket Broker (`broker.hivemq.com:8884` WSS)
- **Topic**: `leeprky/drunkuno/{roomCode}` (Default room: `PRESTON-2026`)
- **Action Payloads**:
  - Full State Broadcast: `JSON.stringify(state)`
  - Emergency Remote Reset: `{"action": "RESET_ALL_DEVICES", "timestamp": Date.now(), "state": state}`
  - Force Portfolio Redirect: `{"action": "FORCE_REDIRECT_PORTFOLIO", "url": "../../index.html", "timestamp": Date.now()}`

---

### 5. Recommended AI Slash Commands

- `/goal`: Run long-running tasks autonomously until fully verified.
- `/plan`: Step-by-step architectural breakdown before executing major redesigns.
- `/browser`: Live browser inspect and visual test.
- `/boost`: Deep strategic thinking and multi-perspective verification.
