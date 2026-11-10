# ✨ AMAZESKIN — Daily Skin Forecast & Regimen Concierge

A modern, science-meets-beauty daily skincare dashboard inspired by premier international brands (*Sephora, Glossier, Glow Recipe, Paula's Choice*).

AMAZESKIN uses **real-time atmospheric climate data** (UV index, ambient humidity, temperature, and AQI) paired with a **rapid 10-second daily skin feeling check-in** to dynamically compute an optimized morning (AM) and evening (PM) skincare prescription.

---

## 🌟 Core Features

### 1. 🌦️ Dynamic Climate & Weather Engine
- **Hyper-Local Environmental Sensing:** Integrates browser geolocation with the open **Open-Meteo API** to read current UV Index, Humidity, and Temperature.
- **Interactive Climate Simulator:** Instantly test how different weather presets dynamically shift skincare formulation recommendations:
  - ☀️ **Sunny Summer Heat (UV 9, 32°C, 28% Humidity):** Switches to photostable SPF 60, antioxidant Vitamin C defense, and barrier hydration.
  - 💧 **Humid Tropical / Monsoon (30°C, 86% Humidity):** Activates oil-balancing BHA pore exfoliants and lightweight gel matrices.
  - ❄️ **Harsh Cold Winter (2°C, 22% Humidity):** Triggers rich ceramide occlusives, Madecassoside barrier balms, and probiotic overnight masks.
  - 🌫️ **Urban Megacity (High AQI 155):** Prompts double cleansing and anti-pollution peptide defense.

### 2. ⚡ 10-Second Daily Skin Check-In
- Quick touch buttons to log how skin feels today (*Balanced, Dry, Oily, Sensitive/Irritated*).
- Select immediate concerns (*Breakouts, Dullness, Redness, Dehydration, Pores*).
- **Barrier Emergency Protocol:** If the user logs redness or barrier irritation, the engine automatically suspends potent chemical exfoliants and retinols, swapping in **La Roche-Posay Cicaplast Baume B5+** and pure hyaluronic recovery.

### 3. 🛡️ Ingredient Safety & Conflict Scanner
- Real-time cross-checking prevents user routine errors:
  - 🚫 **Retinol + Strong AHA/BHA:** Warns against chemical barrier stripping; advises alternating nights.
  - 🚫 **Vitamin C + Retinoid:** Explains pH incompatibility and separates them into AM vs. PM.
  - ✅ **Niacinamide + Vitamin C:** Validated safe for radiant synergy.

### 4. ⏳ Active Ingredient Wait Timer
- Embedded countdown timer with audio chime (synthesized via Web Audio API) and visual circular progress ring.
- Ensures adequate contact time for active exfoliants (BHA/AHA) and pure L-Ascorbic Acid before applying higher pH creams.

### 5. 🧴 Digital Vanity Shelf
- Track products you already own on your physical bathroom shelf.
- Routine automatically displays **"In Your Vanity ✨"** badges for owned items versus newly recommended additions.

### 6. 🛍️ Simulated E-Commerce Experience
- Slide-over Shopping Bag with real-time totals.
- Promo code support: Use **`GLOW20`** for 20% off.
- Express Checkout modal with interactive order confirmation and celebratory confetti animation!

### 7. 📝 1-Minute Skin Diagnostic Quiz
- A 4-step diagnostic survey that fine-tunes skin baseline, sensitivity threshold, and long-term aesthetic goals.

---

## 🚀 How to Run Locally

### Option 1: Instant Browser Launch (Zero Installation)
Simply double-click [`index.html`](file:///d:/Agents/Agent_AS/index.html) in your file explorer, or right-click $\rightarrow$ **Open with Chrome / Edge / Firefox / Safari**.

### Option 2: Python Local Server
Run the built-in server script:
```bash
python server.py
```
Then open your browser to [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deployment & 24/7 Free Automation

- **Free 24/7 Website Hosting:** Deploy via **GitHub Pages**, **Vercel**, or **Netlify** with zero hosting fees and continuous uptime.
- **Daily Multi-Agent Automation (GitHub Actions Cron):** Scheduled via [`.github/workflows/daily_agent_pipeline.yml`](.github/workflows/daily_agent_pipeline.yml) to run daily at 06:00 UTC, audit the platform, and email executive digests to your inbox!
- **See [`automation_guide.md`](automation_guide.md)** for complete step-by-step setup instructions.

---

## 📁 File Structure

```
d:\Agents\Agent_AS\
├── .github/workflows/
│   ├── daily_agent_pipeline.yml # 24/7 Daily Multi-Agent cron schedule & email
│   └── deploy_website.yml       # 24/7 Free GitHub Pages hosting workflow
├── agents/
│   ├── orchestrator.py          # Multi-agent CLI & automated email dispatcher
│   ├── registry.json            # Central agent definitions & cadences
│   ├── *.md                     # Playbooks for all 6 specialized agents
│   └── reports/                 # Historical daily & weekly executive reports
├── index.html                   # Single Page Application & luxury Tailwind UI
├── app.js                       # Reactive recommendation engine, timers, cart
├── catalog.js                   # International brand catalog & conflict rules
├── server.py                    # Python 3 local development server
├── manifest.json                # PWA manifest for mobile/desktop install
├── automation_guide.md          # 24/7 free automation & email setup guide
├── skill.md                     # Domain skills specification
├── instructions.md              # Reproduction & operating manual
└── README.md                    # Project documentation
```
