import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PlaybooksPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Playbooks</h1>
        <p className="text-sm text-muted-foreground">Incident response runbooks and automations are coming soon.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This placeholder completes the four-module layout. Tell me which fourth module you prefer and I’ll build it
          next.
        </CardContent>
      </Card>
    </div>
  )
}
