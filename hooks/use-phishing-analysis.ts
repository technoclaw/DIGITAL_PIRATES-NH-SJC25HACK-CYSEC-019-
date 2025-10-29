"use client"

import { useCallback, useState } from 'react'

/**
 * usePhishingAnalysis
 * Client hook to trigger phishing analysis via the server proxy and poll for result.
 * It uses the server endpoints already present in this project:
 * - POST /api/n8n/phishing  -> proxies to your friend's n8n webhook
 * - GET  /api/n8n/check-status?jobId=... -> polls for the result
 *
 * The n8n webhook should accept a JSON body with { jobId, url, callbackUrl }
 * and call back to /api/n8n/callback when complete.
 */

interface AnalysisResult {
  jobId: string
  url?: string
  threat_score?: string
  verdict?: 'CRITICAL' | 'MEDIUM' | 'LOW' | string
  details?: string
  timestamp?: string
}

export function usePhishingAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const analyzeUrl = useCallback(async (url: string) => {
    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    try {
      // Trigger n8n via our server proxy. We include callbackUrl so n8n can POST results back
      const callbackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/n8n/callback`

      const triggerRes = await fetch('/api/n8n/phishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, url, callbackUrl }),
      })

      if (!triggerRes.ok) {
        const body = await triggerRes.text()
        throw new Error(`Failed to trigger workflow: ${body}`)
      }

      // Poll for result
      const final = await pollForResult(jobId)
      setResult(final)
      setIsAnalyzing(false)
      return final
    } catch (err: any) {
      setError(err?.message || String(err))
      setIsAnalyzing(false)
      throw err
    }
  }, [])

  return { analyzeUrl, isAnalyzing, error, result }
}

async function pollForResult(jobId: string, maxAttempts = 60, intervalMs = 2000): Promise<AnalysisResult> {
  let attempts = 0

  while (attempts < maxAttempts) {
    attempts++
    try {
      const res = await fetch(`/api/n8n/check-status?jobId=${encodeURIComponent(jobId)}`)
      if (res.status === 200) {
        const body = await res.json()
        return body.result
      }

      if (res.status === 202) {
        await sleep(intervalMs)
        continue
      }

      throw new Error(`Unexpected status polling: ${res.status}`)
    } catch (err) {
      if (attempts >= maxAttempts) throw err
      await sleep(intervalMs)
    }
  }

  throw new Error('Polling timed out')
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

