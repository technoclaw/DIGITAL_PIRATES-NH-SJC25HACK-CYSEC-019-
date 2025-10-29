"use client"

import { useDemo } from "../../components/demo-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const { state, setSettings } = useDemo()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Demo-only toggles for alerts and auto-reporting.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Enable email alerts (demo)</Label>
            <Switch id="email" checked={state.settings.email} onCheckedChange={(v) => setSettings({ email: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms">SMS alerts (demo)</Label>
            <Switch id="sms" checked={state.settings.sms} onCheckedChange={(v) => setSettings({ sms: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto">Auto-report to ticketing (demo)</Label>
            <Switch
              id="auto"
              checked={state.settings.autoReport}
              onCheckedChange={(v) => setSettings({ autoReport: v })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
