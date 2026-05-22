# 🌐 NexHub (PULSE) — Corporate Intranet Portal

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blueviolet?style=for-the-badge&logo=vercel)](https://nex-hub-web-yp5n.vercel.app)

**NexHub** (internally codenamed **PULSE**) is a state-of-the-art, fully interactive, and premium **Corporate Intranet Portal** designed to drive communication, engagement, and productivity across modern organizations. Built as a high-performance monorepo using **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**, NexHub delivers a stunning, responsive user experience complete with dark mode, fluid transitions, and real-time interactive components.

🔗 **Explore the Live Site:** nex-hub-web-4zc9.vercel.app

---

## ✨ Features At A Glance

*   **🔒 Persona-Based Authentication**: Seamless login interface with pre-configured mock profiles representing different organization roles:
    *   **Priya (Employee)**: Standard employee portal access.
    *   **Arjun (HR)**: Human resources dashboard with specialized views.
    *   **Meera (Admin)**: Full administrative panel and moderation controls.
*   **📊 Dynamic Dashboard (PULSE Feed)**: 
    *   Interactive corporate newsfeed and company-wide announcements.
    *   Upcoming events calendar and key performance indicators.
    *   Beautiful corporate analytics visualized with **Recharts**.
*   **🏢 Directories & Departments Portal**: 
    *   Explore company departments with visual structure charts and deep-dive detail pages.
    *   Search and filter through the complete **People Directory** featuring instant search and interactive profile pages.
*   **🏆 Peer Kudos & Recognition**:
    *   Promote a positive work culture with a peer-to-peer appreciation wall.
    *   Interactive gamified **Leaderboard** highlighting high-performers.
*   **📁 Knowledge & Document Hub**: 
    *   Categorized repository for company policies, templates, and manuals.
    *   Instant search with simulated download functionality.
*   **💬 Corporate Forums & Discussions**:
    *   Interactive discussion threads with categories, search, and nested reply features.
*   **📸 Photo Gallery**:
    *   Sleek grid gallery showcase for corporate outings, office celebrations, and events.
*   **⚙️ Admin Console**:
    *   High-level moderation, user permission controls, and general application settings.
*   **🎨 Premium UI/UX Aesthetics**:
    *   Modern glassmorphic and HSL-tailored dark/light mode styles.
    *   Smooth transitions powered by **Framer Motion** and responsive layouts tailored to any device.

---

## 🛠️ Technology Stack

*   **Core**: React 18, Vite, TypeScript 5
*   **Styling**: Tailwind CSS, PostCSS (harmonious HSL palettes)
*   **Animations**: Framer Motion
*   **State Management**: Zustand (Auth, Toast notification system, Data persistence)
*   **Charts & Visualization**: Recharts
*   **Routing**: React Router DOM v6
*   **Icons**: Lucide React

---

## 📦 Project Architecture

NexHub uses a modular monorepo structure to keep business logic clean and reusable:

```
NexHub/
├── apps/
│   └── web/                   # Main React + Vite SPA Frontend
│       ├── src/
│       │   ├── components/    # Reusable UI Components (Sidebar, Topbar, Toast, etc.)
│       │   ├── pages/         # View Pages (Dashboard, Profile, Forums, Admin, etc.)
│       │   ├── stores/        # Zustand global state management
│       │   └── styles/        # Global HSL Tailwind design system
└── packages/
    └── shared/                # Shared internal utilities and seed databases
        ├── seeds/             # Seed databases (Employees, Feed, Kudos, Forum, etc.)
        ├── types/             # Shared TypeScript structures
        └── hooks/             # Custom reusable React hooks
```

---

## 🚀 Getting Started Locally

Follow these quick steps to get a local copy up and running:

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed.

### 2. Installation
Clone the repository, go into the root directory, and install the workspace dependencies:
```bash
git clone https://github.com/varshareddygangasani/NexHub..git
cd NexHub-main
npm install
```

### 3. Run Development Server
Start the development server for the web workspace:
```bash
npm run web:dev
```
Your app will be running locally at `http://localhost:5173`.

### 4. Build for Production
To generate a production-ready bundle:
```bash
npm run web:build
```

---

## 📄 License
This project is licensed under the MIT License. Created as a modern intranet solution for enterprise engagement.

