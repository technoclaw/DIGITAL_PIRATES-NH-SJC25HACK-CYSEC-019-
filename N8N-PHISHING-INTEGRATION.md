# n8n Phishing Events Integration - Complete Guide

## ✅ What Was Implemented

Your phishing page now **automatically receives and displays** data from n8n in real-time!

---

## 🔄 How It Works

```
n8n workflow
    ↓ POST
ngrok URL (https://athirst-juelz-convivial.ngrok-free.dev/api/n8n/phishing)
    ↓ forwards to
Your Next.js Server (localhost:3000/api/n8n/phishing)
    ↓ stores in
In-Memory Storage (/api/phishing-events)
    ↓ displayed on
Phishing Page (auto-refreshes every 5 seconds)
```

---

## 📁 Files Modified/Created

### 1. **`components/demo-store.tsx`** (Modified)
Added `addPhishingEvent` function to store phishing events.

**Lines changed:**
- Line 41: Added `addPhishingEvent` to context type
- Lines 79-88: New function to add phishing events
- Line 102: Exported function in provider

### 2. **`app/api/phishing-events/route.ts`** (Created)
New API endpoint to store and retrieve phishing events.

**Features:**
- In-memory storage (keeps last 50 events)
- POST: Stores new events
- GET: Retrieves all events
- Automatic data transformation from n8n format

**Key functions:**
- `mapSeverityToLabel()`: Converts severity (high/medium/low) to label (phishing/suspicious/safe)
- `calculateConfidence()`: Assigns confidence score based on severity
- `getDefaultResponse()`: Provides recommended response based on severity

### 3. **`app/api/n8n/phishing/route.ts`** (Modified)
Updated to store events locally before forwarding to n8n.

**Lines changed:**
- Lines 25-38: Added local storage call

### 4. **`app/phishing/page.tsx`** (Modified)
Updated to fetch and display live events from API.

**Changes:**
- Line 5: Added `useEffect` import
- Line 28: Added `liveEvents` state
- Lines 34-55: Added auto-refresh logic (fetches every 5 seconds)
- Lines 220-221: Updated header to show count of n8n events
- Lines 234-251: Display live events with cyan highlight

---

## 🎨 Visual Indicators

**n8n Events** (highlighted in cyan):
- Background: `bg-cyan-950/20` (subtle cyan glow)
- ID color: `text-cyan-400` (cyan text)
- Shows count in header: "(X from n8n)"

**Demo Events** (regular styling):
- No special background
- Default text colors

---

## 📊 Data Transformation

Your n8n payload:
```json
{
  "status": "ok",
  "source": "n8n-phishing",
  "summary": "Phishing detected",
  "severity": "high"
}
```

Gets transformed to:
```json
{
  "id": "phish-1234567890-abc123",
  "subject": "Phishing detected",
  "from": "n8n-phishing",
  "body": "{\"status\":\"ok\",\"source\":\"n8n-phishing\",...}",
  "label": "phishing",
  "confidence": 0.95,
  "response": "Do not click any links or provide credentials...",
  "timestamp": "2025-01-29T10:25:42.000Z"
}
```

---

## 🔄 Auto-Refresh

The phishing page automatically polls for new events:

**Interval**: Every 5 seconds  
**Endpoint**: `/api/phishing-events` (GET)  
**Behavior**: Updates table without page reload

---

## 📋 Field Mapping

| n8n Field | Maps To | Fallback |
|-----------|---------|----------|
| `summary` | `subject` | "Phishing Alert from n8n" |
| `source` | `from` | "n8n-detection" |
| `severity` | `label` | "safe" |
| `confidence` | `confidence` | Calculated from severity |
| - | `body` | JSON.stringify(entire payload) |
| - | `response` | Generated from severity |
| - | `timestamp` | Current server time |

---

## 🎯 Severity Mapping

| n8n Severity | Table Label | Confidence | Badge Color |
|--------------|-------------|------------|-------------|
| `high`, `critical`, `phishing` | phishing | 95% | Red (destructive) |
| `medium`, `suspicious` | suspicious | 75% | Default |
| `low`, `safe` | safe | 50% | Secondary |

---

## 🧪 Test Your Integration

### Step 1: Send Test Data from n8n

Use your existing n8n HTTP Request node:

**URL:**
```
https://athirst-juelz-convivial.ngrok-free.dev/api/n8n/phishing
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true"
}
```

**Body:**
```json
{
  "status": "ok",
  "source": "n8n-test",
  "summary": "Test Phishing Email Detected",
  "severity": "high"
}
```

### Step 2: Check Your Phishing Page

1. Open: `http://localhost:3000/phishing`
2. Scroll to "Recent phishing events"
3. Within 5 seconds, you should see a **cyan-highlighted row** appear
4. The header will show: "Recent phishing events (1 from n8n)"

### Step 3: Verify in Browser Console

Open Developer Tools → Console, you should see:
```
[Proxy] Storing phishing event locally: {...}
[Proxy] Local storage status: 200
[Phishing Events] Received data from n8n: {...}
[Phishing Events] Stored event: phish-1234567890-abc123
```

---

## 📝 Example Payloads

### High Severity Phishing
```json
{
  "summary": "Urgent: Verify your account",
  "source": "suspicious@example.com",
  "severity": "high",
  "details": "Contains password reset link"
}
```

**Result:**
- Label: phishing
- Confidence: 95%
- Badge: Red
- Response: "Do not click any links..."

### Medium Severity
```json
{
  "summary": "Invoice attached",
  "source": "finance@company.com",
  "severity": "medium"
}
```

**Result:**
- Label: suspicious
- Confidence: 75%
- Badge: Default
- Response: "Verify sender domain..."

### Custom Fields
```json
{
  "subject": "Custom Subject Line",
  "from": "custom@email.com",
  "body": "Full email content here",
  "label": "phishing",
  "confidence": 0.99,
  "response": "Custom response message"
}
```

**Result:**
Uses your exact values without transformation.

---

## 🔍 Monitoring

### Check if Events Are Being Stored

Visit this endpoint directly:
```
http://localhost:3000/api/phishing-events
```

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "id": "phish-...",
      "subject": "...",
      "from": "...",
      "label": "phishing",
      "confidence": 0.95
    }
  ],
  "count": 3
}
```

### Check Next.js Logs

Watch your terminal for:
```
[Proxy] Storing phishing event locally: {...}
[Proxy] Local storage status: 200
[Phishing Events] Received data from n8n: {...}
[Phishing Events] Stored event: phish-xxx
```

### Check Ngrok Dashboard

Visit: `http://127.0.0.1:4040`

Look for:
- POST requests to `/api/n8n/phishing`
- Status: 200 OK
- Response time

---

## 🚨 Troubleshooting

### Issue 1: Events Not Appearing

**Check:**
```powershell
# 1. Is the API working?
Invoke-RestMethod -Uri "http://localhost:3000/api/phishing-events" -Method GET

# 2. Send a test event
$body = @{
    summary = "Test Event"
    source = "manual-test"
    severity = "high"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/phishing-events" `
    -Method POST -Body $body -ContentType "application/json"

# 3. Check if it was stored
Invoke-RestMethod -Uri "http://localhost:3000/api/phishing-events" -Method GET
```

### Issue 2: Events Not Auto-Refreshing

**Solution:**
1. Open Browser Console
2. Check for errors
3. Verify network requests every 5 seconds
4. Look for fetch calls to `/api/phishing-events`

### Issue 3: Wrong Data Format

**Solution:**
The API auto-transforms n8n data. Send ANY JSON payload and it will be stored.

Minimum required: `{}` (empty object)

Optional fields for better display:
- `summary` or `subject`: Shows as subject
- `source` or `from`: Shows as sender
- `severity` or `label`: Determines badge color
- `confidence`: Shows as percentage

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        n8n Workflow                         │
│  Detects phishing → Sends POST to ngrok URL                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Ngrok Public URL                         │
│  https://athirst-juelz-convivial.ngrok-free.dev            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API: /api/n8n/phishing                 │
│  1. Stores event locally (/api/phishing-events)            │
│  2. Forwards to n8n webhook (for their processing)         │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────────┐
│ Local Storage    │          │ n8n Webhook          │
│ (In Memory)      │          │ (External)           │
│ Keeps 50 events  │          │ Returns 404 or 200   │
└────────┬─────────┘          └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│           Browser: Phishing Page Component                  │
│  - Fetches /api/phishing-events every 5 seconds            │
│  - Displays events in table with cyan highlight             │
│  - Shows count of n8n events in header                      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Success Indicators

When everything is working:

1. **In n8n:** HTTP Request node returns 200 OK
2. **In Next.js logs:** See storage confirmation
3. **In phishing page:** Events appear with cyan highlight
4. **In header:** Shows count "(X from n8n)"
5. **Auto-refresh:** New events appear within 5 seconds

---

## 🎉 Your Integration is Live!

**What happens now:**

1. n8n sends phishing data → Your ngrok URL
2. Data is stored automatically
3. Phishing page updates within 5 seconds
4. Events display with cyan highlight
5. No manual refresh needed!

**Test it now:** Send a POST from n8n and watch your phishing page! 🚀
