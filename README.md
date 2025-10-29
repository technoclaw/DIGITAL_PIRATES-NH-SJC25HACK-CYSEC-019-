# DIGITAL_PIRATES 🏴‍☠️

A comprehensive cybersecurity dashboard for threat detection, phishing analysis, and security operations monitoring. Built with Next.js and integrated with n8n automation workflows.

## Features

- **🎯 Real-time Threat Dashboard** - Monitor security events and incidents
- **🎣 Phishing Email Detector** - AI-powered phishing analysis with expandable incident details
- **📊 Log Analysis** - Security log monitoring and visualization
- **🔍 Threat Intelligence** - Real-time threat feed integration
- **🔗 n8n Integration** - Automated security workflows and incident response

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Automation**: n8n workflow integration
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/DIGITAL_PIRATES.git
cd DIGITAL_PIRATES
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
# n8n Webhook URLs
N8N_DASHBOARD_WEBHOOK=your_dashboard_webhook_url
N8N_PHISHING_WEBHOOK=your_phishing_webhook_url
N8N_LOGS_WEBHOOK=your_logs_webhook_url
N8N_THREAT_INTEL_WEBHOOK=your_threat_intel_webhook_url

# Optional: n8n API Key
N8N_API_KEY=your_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Docker Deployment

### Build and Run with Docker

```bash
# Build the image
docker build -t digital-pirates .

# Run the container
docker run -p 3000:3000 \
  -e N8N_DASHBOARD_WEBHOOK=your_webhook \
  -e N8N_PHISHING_WEBHOOK=your_webhook \
  digital-pirates
```

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down
```

## n8n Integration

This application integrates with n8n workflows for automated security operations. Configure your n8n webhooks in `.env.local` to enable:

### Phishing Detection Workflow
The phishing detection expects JSON in this format:
```json
{
  "threat_level": "high",
  "key_findings": [
    "Suspicious domain used in sender address",
    "Embedded phishing link detected in email body"
  ],
  "recommended_actions": [
    "Block sender domain",
    "Notify affected employees"
  ],
  "affected_systems": ["email gateway", "user inboxes"],
  "incident_date_time": "2025-10-29T12:35:00Z",
  "resource_address_or_domain": "malicious-example.com",
  "incident_severity": 9,
  "incident_category": "phishing",
  "risk_score": "high"
}
```

### Webhook Endpoints

- **Dashboard**: `POST /api/n8n/dashboard`
- **Phishing Analysis**: `POST /api/n8n/phishing`
- **Log Analysis**: `POST /api/n8n/logs`
- **Threat Intel**: `POST /api/n8n/threat-intel`

## Features in Detail

### Phishing Email Detector

- Paste email content or upload `.eml` files
- Real-time analysis with confidence scores
- Expandable incident details showing:
  - 🔍 Key Findings
  - ✅ Recommended Actions
  - 📋 Affected Systems
  - ⚠️ Severity Scores
- Copy-to-clipboard response templates

### Dashboard

- Live threat monitoring
- Security event timeline
- Risk score visualization
- Quick action buttons

### Log Analysis

- Real-time log parsing
- Pattern detection
- Anomaly alerts

## Project Structure

```
PIRATES/
├── app/
│   ├── api/              # API routes
│   │   ├── n8n/         # n8n webhook proxies
│   │   └── phishing-events/ # Phishing data storage
│   ├── dashboard/        # Dashboard page
│   ├── phishing/         # Phishing detector page
│   ├── logs/            # Log analysis page
│   └── threat-intel/    # Threat intelligence page
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── Dockerfile          # Docker configuration
└── docker-compose.yml  # Docker Compose config
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `N8N_DASHBOARD_WEBHOOK` | n8n dashboard webhook URL | Yes |
| `N8N_PHISHING_WEBHOOK` | n8n phishing analysis webhook | Yes |
| `N8N_LOGS_WEBHOOK` | n8n logs webhook URL | Yes |
| `N8N_THREAT_INTEL_WEBHOOK` | n8n threat intel webhook | Yes |
| `N8N_API_KEY` | Optional API key for n8n | No |
| `NEXT_PUBLIC_APP_URL` | Public app URL | No |

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Author

Built with ⚡ by the DIGITAL_PIRATES team

---

**⚠️ Security Note**: This is a security monitoring tool. Ensure all webhook URLs and API keys are kept secure and never committed to version control.
