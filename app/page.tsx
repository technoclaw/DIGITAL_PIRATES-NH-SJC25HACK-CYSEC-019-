"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MailWarning, Shield, FileSpreadsheet, ScrollText } from "lucide-react"
import { useDemo } from "../components/demo-store"

export default function Home() {
  const { state } = useDemo()

  const phishingCount = state.phishing.length
  const highCveCount = state.cves.filter((c) => c.cvss >= 7.0).length
  const logAnomalies = state.logs.length
  const policyIssues = state.policies.filter((p) => p.status !== "pass").length

  const events = state.timeline.slice(0, 6)

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-pretty text-3xl font-semibold tracking-tight">PIRATES</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Proactive Intelligent Response and Attack Termination System. Explore phishing detection, threat intel
          summarization, log analysis, and policy assistance.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Phishing Alerts"
          value={phishingCount}
          tone={phishingCount > 0 ? "warn" : "ok"}
          icon={<MailWarning className="h-4 w-4" />}
          href="/phishing"
        />
        <SummaryCard
          title="High-Risk CVEs"
          value={highCveCount}
          tone={highCveCount > 0 ? "warn" : "ok"}
          icon={<Shield className="h-4 w-4" />}
          href="/threat-intel"
        />
        <SummaryCard
          title="Active Log Anomalies"
          value={logAnomalies}
          tone={logAnomalies > 0 ? "warn" : "ok"}
          icon={<FileSpreadsheet className="h-4 w-4" />}
          href="/log-analysis"
        />
        <SummaryCard
          title="Policy Issues"
          value={policyIssues}
          tone={policyIssues > 0 ? "warn" : "ok"}
          icon={<ScrollText className="h-4 w-4" />}
          href="/policy-assistant"
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Latest Activity</h2>
          <Button asChild size="sm" variant="secondary">
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
        <div className="grid gap-3">
          {events.map((e) => (
            <Card key={e.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{e.title}</CardTitle>
                <Badge
                  variant={e.severity === "Critical" ? "destructive" : e.severity === "High" ? "default" : "secondary"}
                >
                  {e.severity}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4 text-sm">
                <div className="text-muted-foreground">
                  <p className="line-clamp-2">{e.body}</p>
                  <p className="mt-1 text-xs">{new Date(e.timestamp).toLocaleString()}</p>
                </div>
                <Button asChild size="sm">
                  <Link href={e.link || "/notifications"}>View</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          {events.length === 0 && (
            <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">No recent activity.</div>
          )}
        </div>
      </section>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  tone,
  icon,
  href,
}: {
  title: string
  value: number
  tone: "ok" | "warn"
  icon: React.ReactNode
  href: string
}) {
  const toneColor = tone === "ok" ? "var(--color-success)" : "var(--color-warning)"
  return (
    <Card className="group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <div style={{ color: toneColor }}>{icon}</div>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <Button asChild size="sm">
          <Link href={href}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
