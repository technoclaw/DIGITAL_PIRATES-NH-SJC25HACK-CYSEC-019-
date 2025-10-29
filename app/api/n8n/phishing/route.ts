import { NextResponse } from 'next/server'

// Server-side proxy to your friend's n8n webhook for phishing analysis.
// Configure the webhook URL and optional auth in server env vars:
// N8N_PHISHING_WEBHOOK - full webhook URL
// N8N_API_KEY - optional bearer token to forward as Authorization

const getAuthHeaders = () => {
  const headers: Record<string, string> = {}
  if (process.env.N8N_API_KEY) headers['Authorization'] = `Bearer ${process.env.N8N_API_KEY}`
  return headers
}

export async function POST(req: Request) {
  const webhook = process.env.N8N_PHISHING_WEBHOOK
  if (!webhook) return NextResponse.json({ error: 'N8N_PHISHING_WEBHOOK not configured' }, { status: 500 })

  let body: any = null
  try {
    body = await req.json()
  } catch (e) {
    // no JSON body provided
  }
  
  try {
    // Store the event locally first
    console.log('[Proxy] Storing phishing event locally:', body)
    
    try {
      const storeRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/phishing-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      console.log('[Proxy] Local storage status:', storeRes.status)
    } catch (storeErr) {
      console.error('[Proxy] Failed to store locally (non-fatal):', storeErr)
    }
    
    // Log minimal info for debugging (no secrets)
    console.log('[Proxy] Forwarding request to n8n webhook:', webhook)
    if (body && body.jobId) console.log('[Proxy] jobId:', body.jobId)

    const res = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: body ? JSON.stringify(body) : JSON.stringify({}),
    })

    const text = await res.text()
    console.log('[Proxy] n8n response status:', res.status)
    // Log first 1000 chars of response for visibility
    console.log('[Proxy] n8n response body (truncated):', typeof text === 'string' ? text.slice(0, 1000) : String(text))

    try {
      const json = JSON.parse(text)
      return NextResponse.json({ status: res.status, data: json }, { status: 200 })
    } catch (e) {
      // response not JSON
      return NextResponse.json({ status: res.status, data: text }, { status: 200 })
    }
  } catch (err: any) {
    console.error('[Proxy] Error forwarding to n8n webhook:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  const webhook = process.env.N8N_PHISHING_WEBHOOK
  if (!webhook) return NextResponse.json({ error: 'N8N_PHISHING_WEBHOOK not configured' }, { status: 500 })

  try {
    // Many webhooks are POST-only. We attempt a GET to the webhook URL; if your friend's workflow
    // exposes a GET-friendly endpoint (e.g., a stored/latest-report URL) this will return it.
    const res = await fetch(webhook, { method: 'GET', headers: { ...getAuthHeaders() } })
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      return NextResponse.json({ status: res.status, data: json }, { status: 200 })
    } catch (e) {
      return NextResponse.json({ status: res.status, data: text }, { status: 200 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
