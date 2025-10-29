"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import Link from "next/link"
import { Bell, User2 } from "lucide-react"
import { DemoProvider, useDemo } from "./demo-store" // Updated import

// --- Helper Components ---

function BellLink() {
  // lightweight component to show unread from client store
  // kept inline for minimal changes
  const { state } = useDemo() // Updated to directly use useDemo
  const unread = state.unread
  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border hover:bg-muted hover:text-foreground"
    >
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <span
          className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground"
          aria-label={`${unread} unread notifications`}
        >
          {unread}
        </span>
      )}
    </Link>
  )
}

// --- Main Client Layout Component ---

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <DemoProvider>
      <>
        <header className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4">
            <nav className="flex h-14 items-center justify-between">
              <a href="/" className="text-balance text-lg font-semibold">
                PIRATES
              </a>
              <div className="flex items-center gap-3">
                <BellLink />
                <Link
                  href="/settings"
                  className="inline-flex h-8 items-center rounded-md border bg-card px-3 text-xs hover:bg-muted hover:text-foreground"
                >
                  Settings
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-8 items-center gap-2 rounded-full border bg-card px-3 text-xs hover:bg-muted hover:text-foreground"
                >
                  <User2 className="h-4 w-4" />
                  Demo User
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-6 py-6">
            <aside className="hidden w-56 shrink-0 md:block">
              <nav className="sticky top-6 rounded-lg border bg-card p-3 text-sm">
                <ul className="grid gap-1">
                  <li>
                    <Link className="block rounded-md px-3 py-2 hover:bg-muted hover:text-foreground" href="/">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link className="block rounded-md px-3 py-2 hover:bg-muted hover:text-foreground" href="/phishing">
                      Phishing Detector
                    </Link>
                  </li>
                  <li>
                    <Link className="block rounded-md px-3 py-2 hover:bg-muted hover:text-foreground" href="/threat-intel">
                      Threat Intelligence
                    </Link>
                  </li>
                  <li>
                    <Link className="block rounded-md px-3 py-2 hover:bg-muted hover:text-foreground" href="/log-analysis">
                      Log Analysis
                    </Link>
                  </li>
                  <li>
                    <Link className="block rounded-md px-3 py-2 hover:bg-muted hover:text-foreground" href="/policy-assistant">
                      Policy Assistant
                    </Link>
                  </li>
                  <li>
                    <Link className="block rounded-md px-3 py-2 hover:bg-muted hover:text-foreground" href="/notifications">
                      Notifications
                    </Link>
                  </li>
                  <li>
                    <Link className="block rounded-md px-3 py-2 hover:bg-muted hover:text-foreground" href="/settings">
                      Settings
                    </Link>
                  </li>
                  <li className="mt-2 border-t pt-2">
                    <Link className="block rounded-md px-3 py-2 hover:bg-muted hover:text-foreground" href="/login">
                      Logout (demo)
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
        <Analytics />
      </>
    </DemoProvider>
  )
}
