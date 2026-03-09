# 🚀 NOMOREDMS — Creator Resource Hub

**The "Check your DMs" era is officially over.**

NOMOREDMS is a high-performance, aesthetically stunning platform designed for modern creators to host, manage, and share their most valuable digital assets. No more manual replies, no more link-in-bio friction—just instant, high-conversion access to the tools that build empires.

---

## ✨ Core Philosophy
Social media commerce is broken by manual DMing. We've built the one URL to rule them all. Whether you're an AI-vlogger, a design guru, or an automation wizard, NOMOREDMS provides a premium "home base" for your digital value.

## 🛠️ Key Features

### 💎 For Users
- **The Resource Hub:** A lightning-fast, searchable database of tools, scripts, Figma templates, and AI prompts.
- **Creator Rolodex:** Discover verified top-tier creators and explore their curated collections.
- **Prompt Forge:** Trending AI prompts for Midjourney, Runway, and more—copied with a single click.
- **Glassmorphism UI:** A futuristic design system with dark mode, interactive shaders, and smooth Framer Motion orchestrations.

### 🛡️ For Admins
- **Interactive Dashboard:** Manage the entire ecosystem with real-time Supabase subscriptions.
- **Triage Center:** Review, edit, and approve resources scraped from social media or manually submitted.
- **Creator Management:** Add, edit, or delete creators with custom slugs and verified badges.
- **Bulk Injection:** Scalable tools to import datasets via CSV or direct DB insertion.
- **Storage Management:** Direct integration with Supabase Storage for high-res avatars and thumbnails.

## 🚀 Technical Architecture

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) |
| **Database** | [Supabase (PostgreSQL)](https://supabase.com/) |
| **Auth & Storage** | Supabase Auth & S3 Buckets |
| **Styling** | Tailwind CSS & CSS Variables |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Graphics** | Three.js & WebGL Shaders |
| **Icons** | Lucide React |

## 📦 Getting Started

### 1. Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com/) Project

### 2. Environment Setup
Create a `.env.local` file in the root:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ADMIN_PASSWORD=your_dashboard_password
```

### 3. Installation
```bash
npm install
npm run dev
```

### 4. Database Setup
Register your buckets (`avatars`, `thumbnails`) in Supabase and apply the RLS policies found in the `supabase/scripts/` directory.

---

## 🎨 Design Aesthetics
The application leverages a "Premium Dark" design system:
- **HSL Color Tokens:** Deep zincs and subtle emerald highlights.
- **Micro-interactions:** Interactive hover states on every card.
- **Shader Backgrounds:** Dynamic, fluid-like background animations for an immersive experience.

---

**Built with ❤️ for the Creator Economy.**
