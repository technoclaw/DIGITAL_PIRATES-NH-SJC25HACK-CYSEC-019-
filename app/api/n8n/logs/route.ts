import { NextResponse } from 'next/server'

// Server-side proxy to n8n webhook for log analysis.
// Configure the webhook URL and optional auth in server env vars:
// N8N_LOGS_WEBHOOK - full webhook URL
// N8N_API_KEY - optional bearer token to forward as Authorization

const getAuthHeaders = () => {
  const headers: Record<string, string> = {}
  if (process.env.N8N_API_KEY) headers['Authorization'] = `Bearer ${process.env.N8N_API_KEY}`
  return headers
}

export async function POST(req: Request) {
  const webhook = process.env.N8N_LOGS_WEBHOOK
  if (!webhook) return NextResponse.json({ error: 'N8N_LOGS_WEBHOOK not configured' }, { status: 500 })

  let body: any = null
  try {
    body = await req.json()
  } catch (e) {
    // no JSON body provided
  }
  try {
    // Log minimal info for debugging (no secrets)
    console.log('[Proxy] Forwarding logs request to n8n webhook:', webhook)
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
  const webhook = process.env.N8N_LOGS_WEBHOOK
  if (!webhook) return NextResponse.json({ error: 'N8N_LOGS_WEBHOOK not configured' }, { status: 500 })

  try {
    // Attempt GET request to webhook URL
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
