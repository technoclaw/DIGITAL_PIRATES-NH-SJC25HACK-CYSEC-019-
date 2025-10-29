import { NextResponse } from 'next/server'

// In-memory store for phishing events
// In production, this would be a database
const phishingEvents: Array<{
  id: string
  subject: string
  from: string
  body: string
  label: 'phishing' | 'suspicious' | 'safe'
  confidence: number
  response: string
  timestamp: string
  // Full n8n data
  rawData?: any
  keyFindings?: string[]
  recommendedActions?: string[]
  affectedSystems?: string[]
  incidentDateTime?: string
  resourceAddress?: string
  incidentSeverity?: number
  riskScore?: string
}> = []

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    console.log('[Phishing Events] Received data from n8n:', data)
    
    // Transform n8n data to match phishing event structure
    // Prioritize most specific severity indicators
    const severityValue = data.incident_severity ?? data.threat_level ?? data.severity ?? data.risk_score ?? data.label
    
    console.log('[DEBUG] severityValue:', severityValue)
    console.log('[DEBUG] data.incident_severity:', data.incident_severity)
    console.log('[DEBUG] data.threat_level:', data.threat_level)
    
    const mappedLabel = mapSeverityToLabel(severityValue)
    console.log('[DEBUG] Mapped label:', mappedLabel)
    
    const event = {
      id: `phish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      subject: data.summary || data.subject || data.incident_category || 'Phishing Alert from n8n',
      from: data.source || data.from || data.resource_address_or_domain || 'n8n-detection',
      body: data.body || JSON.stringify(data),
      label: mappedLabel,
      confidence: data.confidence || calculateConfidence(severityValue),
      response: data.response || getDefaultResponse(severityValue),
      timestamp: data.incident_date_time || new Date().toISOString(),
      // Store full n8n data for detailed view
      rawData: data,
      keyFindings: data.key_findings || [],
      recommendedActions: data.recommended_actions || [],
      affectedSystems: data.affected_systems || [],
      incidentDateTime: data.incident_date_time,
      resourceAddress: data.resource_address_or_domain,
      incidentSeverity: data.incident_severity,
      riskScore: data.risk_score || data.threat_level,
    }
    
    // Add to in-memory store
    phishingEvents.unshift(event)
    
    // Keep only last 50 events
    if (phishingEvents.length > 50) {
      phishingEvents.length = 50
    }
    
    console.log('[Phishing Events] Stored event:', event.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Phishing event stored',
      eventId: event.id 
    }, { status: 200 })
  } catch (error: any) {
    console.error('[Phishing Events] Error storing event:', error)
    return NextResponse.json({ 
      error: 'Failed to store phishing event',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true,
      events: phishingEvents,
      count: phishingEvents.length
    }, { status: 200 })
  } catch (error: any) {
    console.error('[Phishing Events] Error fetching events:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch phishing events',
      details: error.message 
    }, { status: 500 })
  }
}

// Helper functions
function mapSeverityToLabel(severity: string | number): 'phishing' | 'suspicious' | 'safe' {
  if (!severity) return 'safe'
  
  const sev = String(severity).toLowerCase()
  
  // Check for text severity levels
  if (sev === 'high' || sev === 'critical' || sev === 'phishing') return 'phishing'
  if (sev === 'medium' || sev === 'suspicious' || sev === 'moderate') return 'suspicious'
  if (sev === 'low' || sev === 'safe') return 'safe'
  
  // Check for numeric severity (e.g., incident_severity: 9)
  const numSev = Number(severity)
  if (!isNaN(numSev)) {
    if (numSev >= 7) return 'phishing'
    if (numSev >= 4) return 'suspicious'
    return 'safe'
  }
  
  return 'safe'
}

function calculateConfidence(severity: string | number): number {
  if (!severity) return 0.5
  
  const sev = String(severity).toLowerCase()
  
  // Text severity
  if (sev === 'high' || sev === 'critical') return 0.95
  if (sev === 'medium' || sev === 'moderate') return 0.75
  if (sev === 'low') return 0.5
  
  // Numeric severity (scale to 0-1)
  const numSev = Number(severity)
  if (!isNaN(numSev)) {
    if (numSev >= 10) return 0.95
    if (numSev >= 7) return 0.90
    if (numSev >= 4) return 0.70
    return 0.50
  }
  
  return 0.5
}

function getDefaultResponse(severity: string | number): string {
  if (!severity) return 'Appears safe; still avoid clicking unknown links. Verify sender if unsure.'
  
  const sev = String(severity).toLowerCase()
  
  if (sev === 'high' || sev === 'critical') {
    return 'Do not click any links or provide credentials. Report to IT Security and block the sender.'
  }
  if (sev === 'medium' || sev === 'moderate') {
    return 'Verify sender domain and links using an out-of-band channel before responding.'
  }
  
  // Check numeric severity
  const numSev = Number(severity)
  if (!isNaN(numSev) && numSev >= 7) {
    return 'Do not click any links or provide credentials. Report to IT Security and block the sender.'
  }
  
  return 'Appears safe; still avoid clicking unknown links. Verify sender if unsure.'
}

export { phishingEvents }
