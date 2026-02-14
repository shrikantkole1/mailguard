# MailGuard SaaS Logic Blueprint

This document details the specific algorithms, data flows, and business rules required to build MailGuard as a production-grade SaaS.

## 🛡️ Project Name: MailGuard
**Tagline:** Autonomous Email Defense for the Modern Enterprise.

---

## 🧠 1. Authentication & Identity Logic (The Gatekeeper)
**Goal:** Securely log users in, store their credentials without seeing their passwords, and manage sessions.

### The Logic Flow:
1.  **Initiation:** User clicks "Connect with Google".
    *   **Logic:** Redirect to `accounts.google.com` with `client_id`, `redirect_uri`, and `scope=gmail.readonly profile email`.
2.  **Callback Handling:** Google returns a generic code.
    *   **Logic:** Your backend exchanges this code for two tokens:
        *   **Access Token:** (Valid for 1 hour) Used immediately to fetch user profile.
        *   **Refresh Token:** (Valid indefinitely) **CRITICAL**. This must be encrypted before storage.
3.  **User Upsert (Update/Insert):**
    *   **Query:** `db.users.find_one({ email: google_profile.email })`
    *   **Condition:**
        *   **If Exists:** Update `last_login_at = now()`. Return existing `_id`.
        *   **If New:** Create new document. Set `plan="free"`, `scan_count=0`.
4.  **Session Creation:**
    *   **Logic:** Create a JWT (JSON Web Token) containing `{ sub: user_id, plan: "free" }`.
    *   **Security:** Sign it with `SECRET_KEY`. Set cookie as `HttpOnly; Secure`.

---

## 📩 2. Email Ingestion Logic (The Feeder)
**Goal:** Fetch emails from Gmail/Outlook without slowing down the user experience.

### Strategy: Asynchronous Polling (Phase 1)
1.  **The Trigger:** User lands on Dashboard.
    *   **Frontend:** Calls `GET /api/sync`.
2.  **The Background Worker:**
    *   **Step 1 (Decrypt):** Fetch user's `refresh_token` from MongoDB. Decrypt it using `cryptography.fernet`.
    *   **Step 2 (Refresh):** Ask Google for a fresh `access_token`.
    *   **Step 3 (Fetch):** Call Gmail API `users.messages.list(maxResults=10)`.
3.  **The Filter (Idempotency):**
    *   **Logic:** For each email ID returned by Google:
        *   Check MongoDB scans collection: `db.scans.exists({ message_id: email_id })`.
        *   **If True:** Skip (Already scanned).
        *   **If False:** Add to Analysis Queue.

---

## 🕵️ 3. Threat Analysis Logic (The Engine)
**Goal:** Deterministically decide if an email is Safe, Suspicious, or Malicious.

### The "MailGuard Score" Algorithm (0-100):
The analysis runs in parallel across 4 logic gates.

#### A. Domain Intelligence Gate
*   **Input:** Sender Email (`security@paypa1.com`)
*   **Logic:**
    *   **Typosquatting Check:** Calculate Levenshtein Distance against a whitelist of top brands (PayPal, Google, Apple).
        *   If `distance == 1` (e.g., PayPa1 vs PayPal): **Score += 50**.
    *   **Age Check:** Query WHOIS (simulated).
        *   If `domain_age < 14 days`: **Score += 30**.
    *   **Free Provider Check:**
        *   If domain in `[gmail.com, yahoo.com]` AND Subject contains "Urgent Invoice": **Score += 20** (BEC Indicator).

#### B. URL Forensics Gate
*   **Input:** All links in body (`http://192.168.1.5/login`)
*   **Logic:**
    *   **IP-Based URL:** Regex `http://\d{1,3}\.\d{1,3}...`
        *   Match: **Score += 80** (Immediate Flag).
    *   **High-Entropy URL:** Analysis of random characters.
        *   If URL contains > 15 random alphanumeric chars (suspected token): **Score += 15**.
    *   **Redirect Chain:**
        *   If link is `bit.ly`: Follow the redirect (HEAD request). If final destination is different domain: **Score += 10**.

#### C. Social Engineering Gate (NLP)
*   **Input:** Subject + Body Text
*   **Logic:** Keyword Density Analysis.
    *   **Urgency Dictionary:** `["immediate", "24 hours", "suspend", "unauthorized"]` -> **Score += 5 per match**.
    *   **Financial Dictionary:** `["wire", "swift", "bitcoin", "gift card"]` -> **Score += 10 per match**.

---

## 💾 4. Persistence & History Logic (The Memory)
**Goal:** Store results so users can see trends over time.

### MongoDB Schema (`scans` collection):
```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(User)",
  "message_id": "gmail_msg_12345",
  "timestamp": "2023-10-27T10:00:00Z",
  "metadata": {
    "subject": "Urgent Invoice",
    "sender": "bad@actor.com"
  },
  "verdict": {
    "score": 85,
    "classification": "MALICIOUS",
    "triggers": ["IP_URL_DETECTED", "TYPOSQUAT_DOMAIN"]
  }
}
```
*   **Indexing:** Create an index on `{ user_id: 1, timestamp: -1 }` to make loading the dashboard fast.

---

## 💰 5. SaaS Business Logic (The Monetization)
**Goal:** Enforce limits so you don't go bankrupt on API costs.

### Middleware Logic (RateLimiter):
1.  **Interceptor:** Before processing any scan request.
2.  **Check Plan:**
    *   Fetch User Plan from DB.
    *   **If Plan == "Free":** Check `scan_count`.
        *   If `scan_count > 100`: Block Request. Return `HTTP 402 (Payment Required)`.
        *   Else: Increment `scan_count` and Proceed.
    *   **If Plan == "Pro":** Proceed (Unlimited).

---

## 🖥️ 6. Frontend Logic (The User Experience)
**Goal:** Make complex security data look simple.

### State Management (React Query):
*   **Auto-Refetch:** Poll the `/api/recent-threats` endpoint every 10 seconds.
*   **Optimistic UI:** When a user clicks "Delete Email", remove it from the UI immediately (before the API confirms it) to make the app feel instant. If the API fails, roll back the change.

### Visualization Logic:
*   **Score < 30:** Render Green Shield.
*   **Score 30-70:** Render Yellow Warning.
*   **Score > 70:** Render Red Siren + Pulse Animation.
