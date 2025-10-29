# n8n Workflow Setup Guide

## Overview
This guide explains how to configure the n8n workflow for the Phishing Analysis feature using the asynchronous polling pattern.

## Architecture
```
Browser → n8n Webhook → cyber_ai (AI Model) → n8n → Next.js Callback → In-Memory Store
   ↓                                                                            ↑
   └──────────────────── Polls /api/n8n/check-status ──────────────────────────┘
```

## n8n Workflow Configuration

### Step 1: Access n8n
1. Start the Docker containers: `docker-compose up -d`
2. Navigate to http://localhost:5678
3. Login with credentials:
   - Username: `admin`
   - Password: `admin`

### Step 2: Create the Workflow

Create a new workflow with the following nodes:

#### Node 1: Webhook (Trigger)
- **Type**: Webhook
- **HTTP Method**: POST
- **Path**: `phishing-analysis`
- **Response Mode**: Immediately
- **Response Code**: 200
- **Response Data**: JSON
  ```json
  {
    "success": true,
    "jobId": "{{ $json.jobId }}",
    "message": "Analysis started"
  }
  ```

Expected incoming payload:
```json
{
  "jobId": "job_1234567890_abc123",
  "url": "https://suspicious-site.com",
  "callbackUrl": "http://web:3000/api/n8n/callback"
}
```

#### Node 2: HTTP Request - Call AI Model
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `http://cyber_ai:3001/analyze`
- **Authentication**: None
- **Send Body**: true
- **Body Content Type**: JSON
- **Body**:
  ```json
  {
    "jobId": "{{ $json.jobId }}",
    "url": "{{ $json.url }}"
  }
  ```

This node calls the mock AI service. In production, replace `cyber_ai:3001` with your actual AI model endpoint.

#### Node 3: HTTP Request - Send Callback
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `{{ $json.callbackUrl }}` (from original webhook)
- **Authentication**: None
- **Send Body**: true
- **Body Content Type**: JSON
- **Body**:
  ```json
  {
    "jobId": "{{ $node["Webhook"].json.jobId }}",
    "url": "{{ $node["Webhook"].json.url }}",
    "threat_score": "{{ $json.threat_score }}",
    "verdict": "{{ $json.verdict }}",
    "details": "{{ $json.details }}",
    "timestamp": "{{ $json.timestamp }}"
  }
  ```

### Step 3: Activate the Workflow
1. Click the "Active" toggle in the top-right corner
2. The webhook URL will be displayed in the Webhook node
3. Note the production webhook URL format: `http://localhost:5678/webhook/phishing-analysis`

## Service Communication

### Internal Docker Network (`cyber_net`)
All services communicate using internal service names:

- **n8n → cyber_ai**: `http://cyber_ai:3001/analyze`
- **n8n → web**: `http://web:3000/api/n8n/callback`
- **web → n8n**: Not needed (web doesn't call n8n internally)

### External (Browser) Access
- **Browser → n8n**: `http://localhost:5678/webhook/phishing-analysis`
- **Browser → web**: `http://localhost:3000/api/n8n/check-status?jobId=...`

## Testing the Workflow

### Using the Custom Hook in Your Component

```typescript
import { usePhishingAnalysis } from '@/hooks/use-phishing-analysis';

function PhishingAnalysisPage() {
  const { analyzeUrl, isAnalyzing, error, result } = usePhishingAnalysis();

  const handleAnalyze = async () => {
    try {
      const result = await analyzeUrl('https://suspicious-site.com');
      console.log('Analysis complete:', result);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing...' : 'Analyze URL'}
      </button>
      {error && <p>Error: {error}</p>}
      {result && (
        <div>
          <h3>Result</h3>
          <p>Verdict: {result.verdict}</p>
          <p>Threat Score: {result.threat_score}</p>
          <p>Details: {result.details}</p>
        </div>
      )}
    </div>
  );
}
```

### Manual Testing with curl

1. **Trigger analysis**:
```bash
curl -X POST http://localhost:5678/webhook/phishing-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "test_job_123",
    "url": "https://example.com",
    "callbackUrl": "http://web:3000/api/n8n/callback"
  }'
```

2. **Poll for results** (repeat until you get status 200):
```bash
curl http://localhost:3000/api/n8n/check-status?jobId=test_job_123
```

## Production Considerations

### Replace In-Memory Store
The current implementation uses an in-memory Map which will lose data if the server restarts. For production:

1. **Use Redis**:
```typescript
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Store result
await redis.setex(`analysis:${jobId}`, 3600, JSON.stringify(result));

// Retrieve result
const data = await redis.get(`analysis:${jobId}`);
```

2. **Use Database**:
```typescript
await db.analysisResults.create({
  jobId,
  result: JSON.stringify(result),
  expiresAt: new Date(Date.now() + 3600000)
});
```

### Security Enhancements
1. **Add authentication** to the callback endpoint
2. **Validate webhook signatures** from n8n
3. **Implement rate limiting** on polling endpoint
4. **Add request timeouts** and retry logic
5. **Use HTTPS** in production

### Monitoring
1. Add logging for all steps
2. Track analysis duration
3. Monitor polling frequency
4. Set up alerts for failed analyses

## Troubleshooting

### Issue: "Failed to trigger analysis"
- Check if n8n container is running: `docker ps`
- Verify n8n webhook is active in the UI
- Check n8n logs: `docker logs pirates-n8n-1`

### Issue: "Polling timeout"
- Check if cyber_ai is responding: `curl http://localhost:3001/analyze`
- Verify n8n workflow completed successfully
- Check Next.js logs: `docker logs pirates-web-1`

### Issue: "Result not found"
- Ensure callback endpoint is accessible from n8n container
- Verify the shared store module is properly imported
- Check for any CORS issues in browser console
