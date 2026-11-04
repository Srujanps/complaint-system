# 🏛️ Civic Grievance Management System

A production-ready Civic Grievance Redressal and Management System featuring Multimodal AI Triage, automated department routing, vendor contract tracking, citizen feedback loops, and executive governance analytics.

## 🌟 Key Features

- **Multi-Role Portal**:
  - **Citizen**: Submit complaints with photo evidence & GPS coordinates, track resolution progress via unique reference codes (`GRV-2026-XXXXXX`), chat with the 24/7 AI civic assistant, and submit feedback.
  - **Officer**: Departmental triage dashboard, vendor matchmaker recommendations, SLA breach tracking, and formal verification.
  - **Vendor**: Work order assignments dashboard, task acceptance/rejection, SLA timer countdown, and proof-of-work submission.
  - **Representative**: Ward & constituency-level analytics, priority elevation, issue escalation, and executive memos.
  - **Admin**: User & category management, vendor master contracts, email notification logs, and system-wide KPI statistics.
- **AI-Powered Capabilities**:
  - Multimodal Vision & keyword grievance categorization
  - Automated severity scoring & dynamic SLA assignment
  - AI Assistant chatbot for tracking status and citizen guidance
- **Multilingual Support**:
  - English (EN), Hindi (HI), Kannada (KN), Tamil (TA), Telugu (TE)
- **Deployment**:
  - Fully compatible with Vercel Serverless Architecture (Node.js API + Static UI)
  - Also includes the original Java Spring Boot & Docker setup in `Complaint-system`

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js >= 18.0.0

### Run Locally
```bash
# Start the local server
npm start
# or
node server.js
```
Open your browser at `http://localhost:3000`.

---

## 👥 Demo Accounts (Pre-configured)

All demo accounts use password: `password123`

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| **Admin** | `admin` | `password123` | Full administrative control & statistics |
| **Officer** | `officer` | `password123` | Ward Nodal Officer (Assignment & Verification) |
| **Citizen** | `citizen` | `password123` | Grievance submission & tracking |
| **Vendor** | `vendor` | `password123` | QuickFix Infra (Roads & Asphalt Specialist) |
| **Vendor** | `vendor_water` | `password123` | Jal Seva Water Works (Water & Pipelines) |
| **Vendor** | `vendor_electric` | `password123` | BrightLine Electricals (Lighting & Grid) |
| **Vendor** | `vendor_sanitation` | `password123` | EcoClean Waste Management (Sanitation) |
| **Representative** | `representative` | `password123` | Ward 12 Elected Representative |

---

## 🛠️ Production Build

```bash
npm run build
```
This builds and verifies the static assets in `/public` ready for Vercel or cloud CDN deployment.

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Framework Preset: **Other**.
4. Output Directory: **public** (configured in `vercel.json`).
5. (Optional) Set `GEMINI_API_KEY` in Vercel Environment Variables.
6. Deploy!
