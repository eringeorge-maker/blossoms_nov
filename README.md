# 🎭 Blossoms Cultural Festival Platform

> **CHRIST (Deemed to be University) · Central Campus Bangalore**  
> An authentic, mobile-first comic book universe web platform for the annual Blossoms cultural festival.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)

---

## 🎨 Theme & Aesthetic: Authentic Comic Universe

Designed with bold comic typography (`Bangers` display, `Inter` body), Ben-Day halftone screens, speech bubble dialogues, angled story narrative caption boxes, corner issue stamps, and dynamic action bursts:

- **Paper Tint**: `#FFF8E8`
- **Comic Ink**: `#151515` (bold 2px–3px borders, drop shadows)
- **Primary Red**: `#F04438`
- **Comic Yellow**: `#FFD43B`
- **Halftone Patterns**: Authentic Ben-Day screen matrices and pop-art bursts

---

## 🚀 Features & Modules

### 🌐 Public Portal
- **Hero & Comic Masthead**: Dynamic countdown, issue badges, and interactive category explorer.
- **Anthology Catalog**: 31 competition events across Arts, Literature, Stage, and Theatre with instant category filters and search.
- **Festival Timetable**: Chronological schedule spanning November 12 to December 16, 2025, with venue mappings (*KE Auditorium, Audi 911, Bird's Park, Panel Room, Classroom, BB Court*), month filters, and digital upload deadlines.
- **Event Detail Showcases**: Multi-round timelines, official rules markdown, eligibility policies, and coordinator contacts.
- **Comic Bulletin Board**: Critical updates, announcements, and festival alerts.
- **Design System Showcase**: Live preview of halftone screens, speech bubbles, corner stamps, and buttons at `/design-system`.

### 🎓 Student Portal
- **Student Dashboard**: Quick access to registered slots, upcoming competition heats, and announcements.
- **My Registrations**: Manage active registrations and cancellations.
- **Conflict-Aware Schedule**: Real-time overlap detection between multiple registered competition slots.
- **Team Management**: Team formation and roster tracking.
- **Mobile Bottom Navigation**: 5-tab quick navigation tailored for smartphones.

### 🛡️ Admin & Operational Hub
- **Admin Dashboard**: Real-time participant counters and metric summaries.
- **Event Management**: Create, edit, and publish competition events and schedule slots.
- **Security & Scoping**: Role-based access controls (Super Admin, Event Coordinator, Analyst).

---

## 🗄️ Backend & Database Architecture

Full PostgreSQL schema and migrations in `/supabase/migrations/`:
- `001_initial_schema.sql`: 19 tables with enums, constraints, and IST timestamps.
- `002_rls_policies.sql`: Strict Row-Level Security for public, students, coordinators, and admins.
- `003_registration_rpcs.sql`: Concurrency-safe atomic registration with capacity locking.
- `seed.sql`: Pre-loaded test data with official venues, categories, and 31 provisional events.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/zenitsu-mama/blossoms_nov.git
cd blossoms_nov

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build & Typecheck

```bash
# Typecheck and build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📜 Key Architectural Commitments

1. **Registration ≠ Attendance**: Strictly no attendance tracking, check-ins, or QR codes in this platform release.
2. **Cross-Department Eligibility**: All CHRIST students eligible cross-department by default.
3. **Atomic Operations**: Team and individual registrations are strictly atomic and capacity-checked on the database level.
4. **Authoritative Clock**: Client displays are advisory; database server timestamp governs registration openings and cutoffs.

---

## 📄 Documentation

All specifications and schema documents are maintained in `/docs`:
- `docs/specs/`: Original festival requirement packages and schemas.
- `docs/DECISIONS.md`: Log of architectural decisions and trade-offs.
