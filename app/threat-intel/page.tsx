"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AnalysisResult } from "@/components/analysis-result"
import { useDemo } from "../../components/demo-store"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function summarizeIntel(text: string) {
  const cveMatch = text.match(/CVE-\d{4}-\d{4,7}/i)?.[0]
  if (cveMatch) {
    return {
      variant: "warning" as const,
      title: `High Risk: ${cveMatch}`,
      message:
        "Affects Windows 11 systems; exploit code observed in the wild. Patch ASAP and monitor outbound connections.",
    }
  }
  const keywords = [/rce/i, /privilege.*escalation/i, /wormable/i]
  if (keywords.some((k) => k.test(text))) {
    return {
      variant: "warning" as const,
      title: "Elevated Risk",
      message: "Potential RCE or privilege escalation indicated. Prioritize patching and isolate exposed assets.",
    }
  }
  return {
    variant: "info" as const,
    title: "Moderate Risk",
    message: "No urgent indicators found. Track vendor advisories and schedule routine patching.",
  }
}

export default function ThreatIntelPage() {
  const { state } = useDemo()
  const [value, setValue] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    title: string
    message: string
    variant: "success" | "warning" | "danger" | "info"
  } | null>(null)

  function buildSummary(text: string) {
    const cve = text.match(/CVE-\d{4}-\d{4,7}/i)?.[0]
    if (cve) {
      const known = state.cves.find((x) => x.id.toLowerCase() === cve.toLowerCase())
      if (known) {
        return {
          variant: known.cvss >= 9 ? "danger" : known.cvss >= 7 ? "warning" : "info",
          title: `${known.cvss >= 7 ? "High" : "Moderate"} Risk: ${known.id}`,
          message: `${known.title}. Affected: ${known.affected}. CVSS ${known.cvss}. Remediation: ${known.recommended_action}`,
        }
      }
      return {
        variant: "warning" as const,
        title: `Elevated Risk: ${cve}`,
        message: "Not in demo dataset. Prioritize patch evaluation and vendor advisories.",
      }
    }
    return {
      variant: "info" as const,
      title: "Moderate Risk",
      message: "No urgent indicators found. Track vendor advisories and schedule routine patching.",
    }
  }

  async function analyze() {
    const text = selected
      ? JSON.stringify(
          state.cves.find((c) => c.id === selected),
          null,
          2,
        )
      : value
    setLoading(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 1500))
    setResult(buildSummary(text))
    setLoading(false)
  }

  function downloadReport() {
    const sample = state.cves.map((c) => ({ id: c.id, cvss: c.cvss, affected: c.affected }))
    const csv = ["id,cvss,affected", ...sample.map((r) => `${r.id},${r.cvss},"${r.affected}"`)].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "threat_intel_report.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Threat Intelligence Summarizer</h1>
        <p className="text-sm text-muted-foreground">Paste CVE notes or pick a sample CVE to get a concise summary.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="intel">Threat intel or CVE details</Label>
          <Textarea
            id="intel"
            className="min-h-[220px]"
            placeholder="Paste CVE description, advisory notes, or threat feeds…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Select onValueChange={(v) => setSelected(v)} value={selected ?? undefined}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Choose sample CVE" />
              </SelectTrigger>
              <SelectContent>
                {state.cves.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.id} • CVSS {c.cvss}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={analyze} disabled={loading || (!value.trim() && !selected)}>
              {loading ? "Analyzing…" : "Summarize"}
            </Button>
            <Button variant="secondary" onClick={downloadReport}>
              Download Report
            </Button>
          </div>
        </div>

        <section aria-live="polite">
          {loading && <div className="rounded-md border bg-card p-4 text-sm">Generating summary…</div>}
          {result && <AnalysisResult title={result.title} message={result.message} variant={result.variant} />}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Recent CVEs</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>CVSS</TableHead>
                <TableHead>Affected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.cves.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell className="max-w-[360px] truncate">{c.title}</TableCell>
                  <TableCell>{c.cvss}</TableCell>
                  <TableCell className="max-w-[320px] truncate">{c.affected}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  )
}
