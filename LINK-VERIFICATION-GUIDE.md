# n8n Integration Link Verification Guide

## ✅ Current Configuration Status

Based on your `.env.local` file, you have configured:

| Endpoint | Status | URL |
|----------|--------|-----|
| Dashboard | ✅ Configured | `https://digital-pirates.app.n8n.cloud/webhook-test/combined-entry` |
| Phishing | ✅ Configured | `https://digital-pirates.app.n8n.cloud/webhook-test/phishing` |
| Logs | ✅ Configured | `https://digital-pirates.app.n8n.cloud/webhook-test/log-analysis` |
| Threat Intel | ⚠️ Placeholder | `https://test-n8n-instance.com/webhook/threat-intel` |

---

## 🔗 Critical Link Locations

### 1. Environment Variables (`.env.local`)
**Lines: 5, 8, 10, 12**

```env
# Line 5 - Dashboard Webhook
N8N_DASHBOARD_WEBHOOK=https://digital-pirates.app.n8n.cloud/webhook-test/combined-entry

# Line 8 - Phishing Webhook
N8N_PHISHING_WEBHOOK=https://digital-pirates.app.n8n.cloud/webhook-test/phishing

# Line 10 - Logs Webhook
N8N_LOGS_WEBHOOK=https://digital-pirates.app.n8n.cloud/webhook-test/log-analysis

# Line 12 - Threat Intel Webhook (⚠️ NEEDS UPDATE)
N8N_THREAT_INTEL_WEBHOOK=https://test-n8n-instance.com/webhook/threat-intel
```

**What Should Be There:**
- Full HTTPS URL to your n8n webhook endpoint
- Format: `https://your-n8n-instance.com/webhook/your-webhook-path`
- Must be accessible from your server

**If Wrong:**
- ❌ **404 Error**: Webhook path doesn't exist
- ❌ **500 Error**: Cannot reach n8n server
- ❌ **DNS Error**: Domain doesn't resolve
- ❌ **Timeout**: n8n server not responding

---

### 2. Dashboard Route (`app/api/n8n/dashboard/route.ts`)

#### Line 15: Environment Variable Read
```typescript
const webhook = process.env.N8N_DASHBOARD_WEBHOOK
```

**What Should Be There:**
- `process.env.N8N_DASHBOARD_WEBHOOK`
- This reads from `.env.local` line 5

**If Wrong:**
- ❌ Variable name mismatch → Returns: `{ error: 'N8N_DASHBOARD_WEBHOOK not configured' }`

#### Line 29-36: Fetch to n8n
```typescript
const res = await fetch(webhook, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  },
  body: body ? JSON.stringify(body) : JSON.stringify({}),
})
```

**What Should Be There:**
- `fetch(webhook, ...)` - Uses the webhook URL from env
- Method: `'POST'`
- Headers: `'Content-Type': 'application/json'`

**If Wrong:**
- ❌ Wrong method → n8n returns 405 Method Not Allowed
- ❌ Missing headers → n8n may reject the request
- ❌ Wrong URL → Timeout or connection refused

---

### 3. Phishing Route (`app/api/n8n/phishing/route.ts`)

#### Line 15: Environment Variable Read
```typescript
const webhook = process.env.N8N_PHISHING_WEBHOOK
```

**What Should Be There:**
- `process.env.N8N_PHISHING_WEBHOOK`
- This reads from `.env.local` line 8

**If Wrong:**
- ❌ Returns: `{ error: 'N8N_PHISHING_WEBHOOK not configured' }`

#### Line 29-36: Fetch to n8n
```typescript
const res = await fetch(webhook, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  },
  body: body ? JSON.stringify(body) : JSON.stringify({}),
})
```

**What Should Be There:**
- POST request to `https://digital-pirates.app.n8n.cloud/webhook-test/phishing`

**If Wrong:**
- ❌ Network error → `{ error: 'fetch failed' }`
- ❌ 404 → n8n webhook path doesn't exist
- ❌ 500 → n8n internal error

---

### 4. Logs Route (`app/api/n8n/logs/route.ts`)

#### Line 15: Environment Variable Read
```typescript
const webhook = process.env.N8N_LOGS_WEBHOOK
```

**What Should Be There:**
- `process.env.N8N_LOGS_WEBHOOK`
- This reads from `.env.local` line 10

**If Wrong:**
- ❌ Returns: `{ error: 'N8N_LOGS_WEBHOOK not configured' }`

#### Line 29-36: Fetch to n8n
```typescript
const res = await fetch(webhook, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  },
  body: body ? JSON.stringify(body) : JSON.stringify({}),
})
```

**What Should Be There:**
- POST request to `https://digital-pirates.app.n8n.cloud/webhook-test/log-analysis`

**If Wrong:**
- ❌ CORS error (if browser-side)
- ❌ Authentication error (if n8n requires auth)

---

### 5. Threat Intel Route (`app/api/n8n/threat-intel/route.ts`)

#### Line 15: Environment Variable Read
```typescript
const webhook = process.env.N8N_THREAT_INTEL_WEBHOOK
```

**What Should Be There:**
- `process.env.N8N_THREAT_INTEL_WEBHOOK`
- This reads from `.env.local` line 12

**⚠️ CURRENT ISSUE:**
- Your URL is still a placeholder: `https://test-n8n-instance.com/webhook/threat-intel`
- This will fail!

**If Wrong:**
- ❌ **DNS_NOTFOUND**: Domain doesn't exist
- ❌ **ENOTFOUND**: Cannot resolve hostname

#### Line 29-36: Fetch to n8n
```typescript
const res = await fetch(webhook, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  },
  body: body ? JSON.stringify(body) : JSON.stringify({}),
})
```

**What Should Be There:**
- Real n8n webhook URL (not the placeholder)

---

## 🚨 Common Error Scenarios

### Error 1: Environment Variable Not Found
**Location**: Lines 15-16 in all route files  
**Error Message**: `{ error: 'N8N_*_WEBHOOK not configured' }`  
**Cause**: Environment variable is empty or misspelled  
**Fix**: Check `.env.local` spelling matches route file

### Error 2: DNS/Network Errors
**Location**: Line 29 (fetch call)  
**Error Message**: `TypeError: fetch failed` or `ENOTFOUND`  
**Cause**: 
- Invalid domain name
- Server unreachable
- Firewall blocking

**Fix**: 
- Verify URL is accessible: `curl https://your-url.com`
- Check firewall rules
- Ensure n8n server is running

### Error 3: 404 Not Found
**Location**: Line 29 (fetch call)  
**Error Message**: Response status: 404  
**Cause**: Webhook path doesn't exist in n8n  
**Fix**: 
- Check n8n workflow is active
- Verify webhook path matches exactly
- Check for trailing slashes

### Error 4: 401 Unauthorized
**Location**: Line 29 (fetch call)  
**Error Message**: Response status: 401  
**Cause**: n8n requires authentication but API key not provided  
**Fix**: 
- Uncomment line 15 in `.env.local`
- Add: `N8N_API_KEY=your_api_key_here`
- Restart Next.js server

### Error 5: 500 Internal Server Error
**Location**: n8n side  
**Error Message**: Response status: 500  
**Cause**: n8n workflow has an error  
**Fix**: 
- Check n8n workflow logs
- Verify workflow configuration
- Test webhook manually in n8n

### Error 6: Timeout
**Location**: Line 29 (fetch call)  
**Error Message**: `AbortError: The operation was aborted`  
**Cause**: n8n server taking too long to respond  
**Fix**: 
- Check n8n server performance
- Increase timeout (add to fetch options)
- Verify network latency

---

## ✅ Verification Checklist

### Step 1: Check Environment Variables
```powershell
# View your .env.local
Get-Content .env.local

# Verify all 4 webhooks are configured
# Look for lines 5, 8, 10, 12
```

### Step 2: Verify n8n Webhooks Exist
Test each webhook manually:

```powershell
# Dashboard
curl -X POST https://digital-pirates.app.n8n.cloud/webhook-test/combined-entry -H "Content-Type: application/json" -d "{}"

# Phishing
curl -X POST https://digital-pirates.app.n8n.cloud/webhook-test/phishing -H "Content-Type: application/json" -d "{}"

# Logs
curl -X POST https://digital-pirates.app.n8n.cloud/webhook-test/log-analysis -H "Content-Type: application/json" -d "{}"

# Threat Intel (⚠️ Will fail with current URL)
curl -X POST https://test-n8n-instance.com/webhook/threat-intel -H "Content-Type: application/json" -d "{}"
```

### Step 3: Test Through Your API
```powershell
.\test-endpoints.ps1
```

### Step 4: Check Server Logs
Look for these log messages in your Next.js terminal:

✅ **Success:**
```
[Proxy] Forwarding request to n8n webhook: https://digital-pirates.app.n8n.cloud/webhook-test/phishing
[Proxy] jobId: test_001
[Proxy] n8n response status: 200
```

❌ **Failure:**
```
[Proxy] Error forwarding to n8n webhook: TypeError: fetch failed
```

---

## 🔧 Action Required

### Immediate Fix Needed:
**Update Line 12 in `.env.local`:**

```env
# Replace this:
N8N_THREAT_INTEL_WEBHOOK=https://test-n8n-instance.com/webhook/threat-intel

# With your real n8n URL (should match the pattern of your other URLs):
N8N_THREAT_INTEL_WEBHOOK=https://digital-pirates.app.n8n.cloud/webhook-test/threat-intel
```

### After Making Changes:
1. Save `.env.local`
2. Restart your Next.js server:
   ```powershell
   # Press Ctrl+C to stop
   npm run dev
   ```
3. Run tests again:
   ```powershell
   .\test-endpoints.ps1
   ```

---

## 📊 Link Summary Table

| File | Line | Type | Current Value | Should Be |
|------|------|------|---------------|-----------|
| `.env.local` | 5 | Env Var | `https://digital-pirates.app.n8n.cloud/webhook-test/combined-entry` | ✅ Correct |
| `.env.local` | 8 | Env Var | `https://digital-pirates.app.n8n.cloud/webhook-test/phishing` | ✅ Correct |
| `.env.local` | 10 | Env Var | `https://digital-pirates.app.n8n.cloud/webhook-test/log-analysis` | ✅ Correct |
| `.env.local` | 12 | Env Var | `https://test-n8n-instance.com/webhook/threat-intel` | ❌ **UPDATE NEEDED** |
| `dashboard/route.ts` | 15 | Code | `process.env.N8N_DASHBOARD_WEBHOOK` | ✅ Correct |
| `dashboard/route.ts` | 29 | Code | `fetch(webhook, {method: 'POST',...})` | ✅ Correct |
| `phishing/route.ts` | 15 | Code | `process.env.N8N_PHISHING_WEBHOOK` | ✅ Correct |
| `phishing/route.ts` | 29 | Code | `fetch(webhook, {method: 'POST',...})` | ✅ Correct |
| `logs/route.ts` | 15 | Code | `process.env.N8N_LOGS_WEBHOOK` | ✅ Correct |
| `logs/route.ts` | 29 | Code | `fetch(webhook, {method: 'POST',...})` | ✅ Correct |
| `threat-intel/route.ts` | 15 | Code | `process.env.N8N_THREAT_INTEL_WEBHOOK` | ✅ Correct |
| `threat-intel/route.ts` | 29 | Code | `fetch(webhook, {method: 'POST',...})` | ✅ Correct |

---

## ✅ Final Answer to Your Question

**Is everything set on the frontend to connect to n8n?**

Almost! Here's the status:

✅ **Working (3/4):**
- Dashboard endpoint
- Phishing endpoint
- Logs endpoint

❌ **Needs Fix (1/4):**
- Threat Intel endpoint (placeholder URL)

**Action Required:**
Update line 12 in `.env.local` with the real threat intel webhook URL from your n8n instance.
