"use client"

import React, { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AnalysisResult } from "@/components/analysis-result"
import { useDemo } from "../../components/demo-store"
import { usePhishingAnalysis } from '@/hooks/use-phishing-analysis'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Verdict = "Phishing" | "Suspicious" | "Safe"

export default function PhishingPage() {
  const { state, addNotification } = useDemo()
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [verdict, setVerdict] = useState<{
    verdict: Verdict
    confidence: number
    reasons: string[]
    response: string
  } | null>(null)
  const [liveEvents, setLiveEvents] = useState<any[]>([])
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // n8n integration hook
  const { analyzeUrl, isAnalyzing, error: n8nError, result: n8nResult } = usePhishingAnalysis()
  const [n8nJson, setN8nJson] = useState<any>(null)
  
  // Fetch live events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/phishing-events')
        const data = await res.json()
        if (data.success && data.events) {
          setLiveEvents(data.events)
        }
      } catch (error) {
        console.error('Failed to fetch live events:', error)
      }
    }
    
    // Fetch initially
    fetchEvents()
    
    // Poll every 5 seconds for new events
    const interval = setInterval(fetchEvents, 5000)
    
    return () => clearInterval(interval)
  }, [])

  function simulate(text: string) {
    const hits = [
      { rx: /reset\s*password/i, reason: "Contains 'reset password' lure" },
      { rx: /urgent|immediately/i, reason: "Urgency language" },
      { rx: /invoice attached/i, reason: "Mentions 'invoice attached'" },
      { rx: /click .*(link|here)/i, reason: "Click-link instruction" },
      { rx: /(verify|confirm).*(account|identity)/i, reason: "Asks to verify account" },
    ].filter((r) => r.rx.test(text))
    let v: Verdict = "Safe"
    let conf = 0.6
    if (hits.length >= 2) {
      v = "Phishing"
      conf = 0.93
    } else if (hits.length === 1) {
      v = "Suspicious"
      conf = 0.72
    }
    const response =
      v === "Phishing"
        ? "Do not click any links or provide credentials. Report to IT Security and block the sender."
        : v === "Suspicious"
          ? "Verify sender domain and links using an out-of-band channel before responding."
          : "Appears safe; still avoid clicking unknown links. Verify sender if unsure."

    return { verdict: v, confidence: conf, reasons: hits.map((h) => h.reason), response }
  }

  async function analyze() {
    setLoading(true)
    setVerdict(null)
    await new Promise((r) => setTimeout(r, 1500))
    const res = simulate(value)
    setVerdict(res)

    if (res.verdict === "Phishing") {
      addNotification({
        title: "Critical: Phishing detected",
        body: `Phishing email indicators found. Confidence ${(res.confidence * 100).toFixed(0)}%. Recommended: Block sender and alert users.`,
        severity: "Critical",
        link: "/phishing",
      })
    }

    setLoading(false)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setValue(String(reader.result || ""))
    reader.readAsText(f)
  }

  function downloadReport() {
    const csv = `subject,verdict,confidence\nexample@demo,${verdict?.verdict || "N/A"},${verdict ? (verdict.confidence * 100).toFixed(0) + "%" : "N/A"}\n`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "phishing_report.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Phishing Email Detector</h1>
        <p className="text-sm text-muted-foreground">Paste an email or upload a .eml file, then run demo analysis.</p>
      </header>

      <div className="space-y-3">
        <Label htmlFor="emailText">Email content</Label>
        <Textarea
          id="emailText"
          className="min-h-[220px]"
          placeholder="Paste suspicious email content here..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <input aria-label="Upload .eml" type="file" accept=".eml,.txt" onChange={onFile} className="text-xs" />
          
          <Button onClick={async () => {
            if (!value.trim()) return
            try {
              await analyzeUrl(value)
              // result is available in state via usePhishingAnalysis.result (polled)
              setN8nJson((window as any).__lastN8nResult__ || null)
            } catch (e) {
              console.error('n8n analyze error', e)
            }
          }} disabled={isAnalyzing || !value.trim()}>
            {isAnalyzing ? 'Analyzing via n8n…' : 'Analyze via n8n'}
          </Button>
          <Button variant="secondary" onClick={downloadReport}>
            Download Report
          </Button>
          <span className="text-xs text-muted-foreground">Demo runs locally; no data leaves your browser.</span>
        </div>
      </div>

      <section aria-live="polite" className="space-y-4">
        {loading && <div className="rounded-md border bg-card p-4 text-sm">Running detection…</div>}
        {verdict && (
          <div className="space-y-3">
            <AnalysisResult
              title={
                verdict.verdict === "Phishing"
                  ? "⚠️ Phishing Detected!"
                  : verdict.verdict === "Suspicious"
                    ? "Suspicious Indicators"
                    : "Looks Safe"
              }
              message={`Recommended Response: ${verdict.response}`}
              variant={
                verdict.verdict === "Phishing" ? "danger" : verdict.verdict === "Suspicious" ? "warning" : "success"
              }
            />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">Verdict: {verdict.verdict}</Badge>
                  <Badge variant="secondary">Confidence: {(verdict.confidence * 100).toFixed(0)}%</Badge>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  {verdict.reasons.length ? (
                    verdict.reasons.map((r, i) => <li key={i}>{r}</li>)
                  ) : (
                    <li>No specific indicators matched.</li>
                  )}
                </ul>
                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(verdict.response)
                    }}
                  >
                    Copy Safe Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {n8nResult && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">n8n Report (latest)</h2>
          <Card>
            <CardContent>
              <pre className="max-h-96 overflow-auto text-xs">{JSON.stringify(n8nResult, null, 2)}</pre>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Recent phishing events {liveEvents.length > 0 && <span className="text-sm text-cyan-400">({liveEvents.length} from n8n)</span>}</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Show live events from n8n first */}
              {liveEvents.map((p) => (
                <React.Fragment key={p.id}>
                  <TableRow 
                    className="bg-cyan-950/20 cursor-pointer hover:bg-cyan-900/30"
                    onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                  >
                    <TableCell className="text-cyan-400">
                      <span className="text-lg">{expandedRow === p.id ? '▼' : '▶'}</span>
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate font-medium">{p.subject}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{p.from}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.label === "phishing" ? "destructive" : p.label === "suspicious" ? "default" : "secondary"
                        }
                      >
                        {p.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{Math.round(p.confidence * 100)}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  {expandedRow === p.id && (
                    <TableRow key={`${p.id}-expanded`} className="bg-cyan-950/10">
                      <TableCell colSpan={6} className="p-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Key Details */}
                            <Card className="bg-background/50">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">Incident Details</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                {p.resourceAddress && (
                                  <div>
                                    <span className="font-medium text-muted-foreground">Resource/Domain: </span>
                                    <span className="text-red-400 font-mono">{p.resourceAddress}</span>
                                  </div>
                                )}
                                {p.incidentSeverity && (
                                  <div>
                                    <span className="font-medium text-muted-foreground">Severity Score: </span>
                                    <Badge variant="destructive">{p.incidentSeverity}/10</Badge>
                                  </div>
                                )}
                                {p.riskScore && (
                                  <div>
                                    <span className="font-medium text-muted-foreground">Risk Score: </span>
                                    <Badge variant="destructive">{p.riskScore}</Badge>
                                  </div>
                                )}
                                {p.incidentDateTime && (
                                  <div>
                                    <span className="font-medium text-muted-foreground">Incident Time: </span>
                                    <span>{new Date(p.incidentDateTime).toLocaleString()}</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* Affected Systems */}
                            {p.affectedSystems && p.affectedSystems.length > 0 && (
                              <Card className="bg-background/50">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm font-semibold">Affected Systems</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex flex-wrap gap-2">
                                    {p.affectedSystems.map((system: string, idx: number) => (
                                      <Badge key={idx} variant="outline" className="bg-orange-950/30">
                                        {system}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>

                          {/* Key Findings */}
                          {p.keyFindings && p.keyFindings.length > 0 && (
                            <Card className="bg-background/50">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">🔍 Key Findings</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {p.keyFindings.map((finding: string, idx: number) => (
                                    <li key={idx} className="text-yellow-400">{finding}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          )}

                          {/* Recommended Actions */}
                          {p.recommendedActions && p.recommendedActions.length > 0 && (
                            <Card className="bg-background/50">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">✅ Recommended Actions</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="list-decimal list-inside space-y-1 text-sm">
                                  {p.recommendedActions.map((action: string, idx: number) => (
                                    <li key={idx} className="text-green-400">{action}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          )}

                          {/* Response */}
                          {p.response && (
                            <Card className="bg-background/50">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">📋 Recommended Response</CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm">
                                <p className="mb-3">{p.response}</p>
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(p.response)
                                  }}
                                >
                                  Copy Response
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {/* Show demo events */}
              {state.phishing.map((p) => (
                <TableRow key={p.id}>
                  <TableCell></TableCell>
                  <TableCell className="max-w-[260px] truncate">{p.subject}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{p.from}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.label === "phishing" ? "destructive" : p.label === "suspicious" ? "default" : "secondary"
                      }
                    >
                      {p.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{Math.round(p.confidence * 100)}%</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(p.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  )
}
