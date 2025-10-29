"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState } from "react"
import demo from "@/data/demo-data"

type Severity = "Critical" | "High" | "Medium" | "Low"
type Notification = {
  id: string
  title: string
  body: string
  severity: Severity
  link?: string
  timestamp: string
  read: boolean
}

type DemoState = {
  phishing: {
    id: string
    subject: string
    from: string
    body: string
    label: "phishing" | "suspicious" | "safe"
    confidence: number
    response: string
  }[]
  cves: { id: string; title: string; affected: string; cvss: number; summary: string; recommended_action: string }[]
  logs: { id: string; summary: string; severity: Severity; host: string; ip: string; timestamp: string }[]
  policies: { id: string; title: string; status: "pass" | "warn" | "fail" }[]
  notifications: Notification[]
  unread: number
  timeline: Notification[]
  settings: { email: boolean; sms: boolean; autoReport: boolean }
  sampleLogs: Record<string, string>
}

const DemoCtx = createContext<{
  state: DemoState
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void
  addPhishingEvent: (event: Omit<DemoState['phishing'][0], 'id'>) => void
  markAllRead: () => void
  setSettings: (p: Partial<DemoState["settings"]>) => void
} | null>(null)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo<DemoState>(() => {
    const notifs = demo.notifications.map((n) => ({ ...n, read: n.read ?? false }))
    return {
      phishing: demo.phishing,
      cves: demo.cves,
      logs: demo.logs,
      policies: demo.policies,
      notifications: notifs,
      unread: notifs.filter((n) => !n.read).length,
      timeline: [...notifs].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
      settings: { email: true, sms: false, autoReport: false },
      sampleLogs: demo.sampleLogs,
    }
  }, [])

  const [state, setState] = useState<DemoState>(initial)

  function addNotification(n: Omit<Notification, "id" | "timestamp" | "read">) {
    const next: Notification = {
      id: `note-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...n,
    }
    setState((s) => {
      const notifications = [next, ...s.notifications]
      const unread = s.unread + 1
      const timeline = [next, ...s.timeline]
      return { ...s, notifications, unread, timeline }
    })
  }

  function addPhishingEvent(event: Omit<DemoState['phishing'][0], 'id'>) {
    const newEvent = {
      id: `phish-${Math.random().toString(36).slice(2, 8)}`,
      ...event,
    }
    setState((s) => ({
      ...s,
      phishing: [newEvent, ...s.phishing],
    }))
  }

  function markAllRead() {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unread: 0,
    }))
  }

  function setSettings(p: Partial<DemoState["settings"]>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...p } }))
  }

  return <DemoCtx.Provider value={{ state, addNotification, addPhishingEvent, markAllRead, setSettings }}>{children}</DemoCtx.Provider>
}

export function useDemo() {
  const ctx = useContext(DemoCtx)
  if (!ctx) throw new Error("useDemo must be used within DemoProvider")
  return ctx
}
