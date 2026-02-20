# SupplyGuard AI 🛡️

![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white)

**SupplyGuard AI** is a next-generation Supply Chain Disruption & Prediction Platform. It leverages the blazing-fast Gemini 2.0 Flash Multimodal Live API and a real-time isolated Firebase backend to provide global logistics managers with an interactive, intelligent "What-If" analysis console.

## ✨ Features

- **🌐 Interactive Risk Map:** Real-time visualization of interconnected global supply chain nodes (ports, factories, warehouses) using `react-simple-maps`.
- **🗣️ AI Voice Assistant:** A sleek, low-latency, two-way voice assistant powered natively by the **Gemini 2.0 Flash WebSocket API**. Talk to the AI to query your network's health.
- **🔮 Predictive AI Engine:** Click on any high-risk node to instantly run "What-If" analysis. The system mocks live external telemetry (Weather, Geopolitical Traffic) and pipes it to Gemini to generate timeline delay predictions and alternative routing suggestions.
- **🚨 Automated Alerting System:** Simulated dynamic ingestion of global events (e.g. typhoons, strikes) that trigger system-wide, real-time toast notifications and populate an interactive Alerts Feed.
- **🔐 True Multi-Tenant Security:** Full Role-Based Access Control (Admin vs. Viewer) and complete Data Isolation. Every authenticated user operates inside their own Firebase sandbox. 

## 🏗️ Technology Stack

- **Frontend:** Next.js (App Router), React, Vanilla CSS, Lucide Icons
- **Mapping:** `react-simple-maps`, `d3-geo`
- **Notifications:** `react-hot-toast`
- **Backend/Database:** Firebase Authentication & Cloud Firestore (Real-time Document DB)
- **AI/LLM:** Google Gemini 2.0 Flash Multimodal Native API (`@google/generative-ai`)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `18.x` or higher
- A Firebase Project (with Auth and Firestore enabled)
- A Google Gemini API Key

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

### 3. Installation
```bash
npm install
# or
yarn install
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 💾 Seeding Database
Because the platform uses Tenant-Isolated databases, your dashboard will be empty when you first log in! 
1. Navigate to the **Settings** page via the sidebar.
2. Click the purple **Seed Template Data** button.
3. The platform will automatically populate your secure Firebase sandbox with global nodes, routes, and risk events.

---

*Built with ❤️ utilizing the capabilities of the Gemini API.*

### �️ Platform Structure (6 Pages Total)

- 🔐 **Login** - Secure tenant authentication
- 📊 **Dashboard ⭐** - High-level metrics and alerts
- 🌍 **Network Map** - Interactive global logistics visualization
- ⚠️ **Risk Analysis** - Deep-dive into specific disruptions
- 🔮 **Predictions & Suggestions** - AI-generated alternative routes
- 🗣️ **Voice Assistant / Alerts** - Two-way voice interaction with Gemini
