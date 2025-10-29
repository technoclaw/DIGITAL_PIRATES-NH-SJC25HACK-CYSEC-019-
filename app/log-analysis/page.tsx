"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AnalysisResult } from "@/components/analysis-result"
import { useDemo } from "../../components/demo-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

function Sparkline() {
  // tiny inline "chart"
  const bars = [3, 5, 2, 8, 4, 6, 9, 5]
  const max = Math.max(...bars)
  return (
    <div className="mt-2 flex items-end gap-1" aria-label="Event counts sparkline">
      {bars.map((v, i) => (
        <div
          key={i}
          style={{ height: `${(v / max) * 48}px`, backgroundColor: "var(--color-chart-1)" }}
          className="w-4 rounded-sm"
        />
      ))}
    </div>
  )
}

export default function LogAnalysisPage() {
  const { state, addNotification } = useDemo()
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<{
    summary: string
    items: { severity: "Critical" | "High" | "Medium" | "Low"; host: string; ip: string; note: string }[]
  } | null>(null)

  function analyzeLogs(text: string) {
    const items: { severity: "Critical" | "High" | "Medium" | "Low"; host: string; ip: string; note: string }[] = []
    const failedByIp = new Map<string, number>()
    text.split("\n").forEach((line) => {
      const ip = line.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/)?.[0] || "0.0.0.0"
      if (/failed login|authentication failure/i.test(line)) {
        failedByIp.set(ip, (failedByIp.get(ip) || 0) + 1)
      }
      if (/nmap|masscan/i.test(line)) {
        items.push({ severity: "High", host: "unknown", ip, note: "Reconnaissance scan detected" })
      }
      if (/drop\s+table|union\s+select/i.test(line)) {
        items.push({ severity: "High", host: "db-01", ip, note: "Possible SQL injection attempt" })
      }
    })
    for (const [ip, count] of failedByIp) {
      if (count > 3) {
        items.push({ severity: "Critical", host: "web-01", ip, note: `>3 failed logins observed (${count})` })
      }
    }
    const summary = items.length ? "Anomalies identified. Review and mitigate." : "No critical anomalies found."
    return { summary, items }
  }

  async function run() {
    setLoading(true)
    setAnalysis(null)
    await new Promise((r) => setTimeout(r, 1600))
    const res = analyzeLogs(value)
    setAnalysis(res)
    if (res.items.some((i) => i.severity === "Critical")) {
      addNotification({
        title: "High: Log anomaly found",
        body: "Multiple failed login attempts detected. Recommended: block IP and investigate.",
        severity: "High",
        link: "/log-analysis",
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
    const csv = [
      "severity,host,ip,note",
      ...(analysis?.items || []).map((i) => `${i.severity},${i.host},${i.ip},"${i.note}"`),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "log_analysis_report.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Log Analysis</h1>
        <p className="text-sm text-muted-foreground">Upload a log file or paste logs to surface notable signals.</p>
      </header>

      <div className="space-y-3">
        <Label htmlFor="logs">Logs</Label>
        <Textarea
          id="logs"
          className="min-h-[220px] font-mono"
          placeholder={"Paste logs here…"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <input aria-label="Upload logs" type="file" accept=".txt,.log,.csv" onChange={onFile} className="text-xs" />
          <Select onValueChange={(v) => setValue(state.sampleLogs[v] || "")}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Sample logs" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(state.sampleLogs).map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={run} disabled={loading || !value.trim()}>
            {loading ? "Analyzing…" : "Run Analysis"}
          </Button>
          <Button variant="secondary" onClick={downloadReport}>
            Download Report
          </Button>
        </div>
      </div>

      <section aria-live="polite" className="space-y-3">
        {loading && <div className="rounded-md border bg-card p-4 text-sm">Scanning…</div>}
        {analysis && (
          <>
            <AnalysisResult
              title={analysis.items.length ? "Suspicious Activity Detected" : "No Critical Anomalies Found"}
              message={analysis.summary}
              variant={analysis.items.length ? "warning" : "success"}
            />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Anomalies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {analysis.items.length === 0 && <div className="text-muted-foreground">No anomalies.</div>}
                {analysis.items.map((i, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 rounded-md border p-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            i.severity === "Critical" ? "destructive" : i.severity === "High" ? "default" : "secondary"
                          }
                        >
                          {i.severity}
                        </Badge>
                        <span className="font-medium">{i.host}</span>
                        <span className="text-muted-foreground">{i.ip}</span>
                      </div>
                      <div className="mt-1 text-muted-foreground">{i.note}</div>
                    </div>
                    <ul className="ml-auto list-disc pl-4 text-xs text-muted-foreground">
                      <li>Block offending IP</li>
                      <li>Force password reset</li>
                      <li>Review access logs</li>
                    </ul>
                  </div>
                ))}
                <Sparkline />
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </div>
  )
}
