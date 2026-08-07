# 💰 FundMe — PERN Crowdfunding Platform

A modern, full-stack crowdfunding and social engagement platform built as a Final Year Project. FundMe bridges the gap between campaign discovery and community-driven backing — all in one space.

> **Status:** Actively in development · Core platform functional · Payment processing live via Stripe

---

## 📖 About

FundMe is a transparent crowdfunding platform where creators launch campaigns, backers discover and fund projects through a social feed, and communities form organically around shared goals. Unlike traditional platforms that separate fundraising from engagement, FundMe unifies both experiences.

### Problems It Solves

| Problem | Our Approach |
| :--- | :--- |
| **Cold-Start Discovery** | Social feed-first algorithm surfaces campaigns organically alongside community posts |
| **Fragmented Communities** | Backers and creators interact in one platform — no need for separate Discord/WhatsApp groups |
| **Trust & Transparency** | KYC-verified creator profiles, real-time campaign progress tracking, and direct updates |
| **Payment Reliability** | Stripe webhook safety net ensures no payment is lost even if the browser closes mid-transaction |

---

## 🏗️ Architecture Overview

The project follows a **split monorepo** pattern with independent frontend and backend services, containerized via Docker Compose.

```
PERN-Funding-App/
├── frontend/          → React SPA (Vite + TypeScript + TailwindCSS)
├── backend/           → Express.js REST API (Node.js + PostgreSQL)
│   ├── prisma/        → Prisma ORM schema & client
│   └── src/
│       ├── config/    → Database connections (Prisma Client + pg Pool)
│       ├── modules/   → Feature-based modular architecture
│       │   ├── auth/         → JWT authentication & RBAC
│       │   ├── users/        → User profiles & stats
│       │   ├── campaigns/    → Campaign CRUD & lifecycle
│       │   ├── payments/     → Stripe integration & donation flow
│       │   ├── posts/        → Social feed posts
│       │   ├── comments/     → Polymorphic comments
│       │   ├── likes/        → Polymorphic likes
│       │   └── follows/      → User follow system
│       ├── middlewares/      → Auth guards & error handling
│       └── utils/            → JWT, hashing, pagination helpers
└── docker-compose.yml → Container orchestration
```

> 📚 **Deep-dive documentation:**
> - [Frontend Architecture & Local Setup](./frontend/README.md)
> - [Backend API & Database Setup](./backend/README.md)

---

## ⚙️ Tech Stack

### Frontend
| Technology | Purpose |
| :--- | :--- |
| React 19 | UI library |
| TypeScript | Type safety |
| Vite (Rolldown) | Build tooling & dev server |
| TailwindCSS v4 | Utility-first styling |
| React Router DOM v7 | Client-side routing |
| Stripe React SDK | Payment UI elements |
| Lucide React | Icon system |
| React Toastify | Toast notifications |

### Backend
| Technology | Purpose |
| :--- | :--- |
| Node.js + Express v5 | REST API server |
| PostgreSQL | Relational database |
| Prisma ORM | Type-safe database client (CRUD models) |
| node-postgres (`pg`) | Raw SQL for financial transactions |
| Stripe SDK | Payment processing & webhooks |
| JWT + bcrypt | Authentication & password hashing |
| Joi | Request validation |
| Serverless Framework | AWS Lambda deployment support |

### DevOps & Tooling
| Technology | Purpose |
| :--- | :--- |
| Docker + Docker Compose | Containerized development & deployment |
| Nginx | Frontend production serving |
| Nodemon + tsx | Hot-reload development server |
| ESLint | Code quality |

---

## 🗄️ Database Architecture

### Hybrid Access Pattern (Prisma ORM + Raw SQL)

The backend intentionally uses a **dual database access strategy** to demonstrate proficiency in both modern ORM tooling and low-level SQL:

- **Prisma Client** — Used across standard CRUD models (`Users`, `Posts`, `Comments`, `Likes`, `Follows`, `Campaigns`) for type-safe queries, relation modeling, and schema management.
- **Raw SQL via `pg`** — Used in payment processing and financial transactions (`payments.controller.js`, `campaign.service.js`) for explicit `BEGIN`/`COMMIT`/`ROLLBACK` transaction control, parameterized queries, and fine-grained connection pooling.

### Data Models

```
Users ─┬─→ Campaigns ──→ Donations
       ├─→ Posts
       ├─→ Comments (polymorphic: targets posts & campaigns)
       ├─→ Likes (polymorphic: targets posts & campaigns)
       └─→ Follows (self-referential many-to-many)
```

---

## ✅ Implemented Features

### Authentication & Authorization
- [x] JWT-based signup and login with bcrypt password hashing
- [x] Role-Based Access Control (RBAC): `user`, `moderator`, `fundraiser`, `admin`
- [x] Input validation via Joi schemas
- [x] Admin panel for user management, role assignment, and KYC verification

### Campaign Management
- [x] Full CRUD for funding campaigns (create, read, update, soft-delete)
- [x] Automatic status transitions: `active` → `ended` (deadline passed) / `completed` (goal reached)
- [x] Owner-only edit/delete authorization
- [x] Campaign discovery with pagination and status filtering

### Payment Processing (Stripe)
- [x] Stripe PaymentIntent-based donation flow
- [x] Idempotent intent creation (prevents duplicate charges on double-click)
- [x] Atomic donation fulfillment with DB transaction locks
- [x] Stripe webhook safety net (catches payments if frontend confirm fails)
- [x] Stale pending donation cleanup with Stripe intent cancellation
- [x] Automatic campaign goal-tracking and amount aggregation
- [x] Full refund processing on campaign deletion

### Social Features
- [x] Social feed with posts (create, update, soft-delete, paginated listing)
- [x] Polymorphic comments system (works on both posts and campaigns)
- [x] Polymorphic likes/reactions system
- [x] User follow/unfollow system with follower/following counts
- [x] User profile pages with activity stats (posts, campaigns, backed projects, total contributed)

### Infrastructure
- [x] Docker Compose for full-stack containerized deployment
- [x] Nginx reverse proxy for frontend production builds
- [x] AWS Lambda deployment support via Serverless Framework
- [x] Centralized error handling middleware
- [x] Health check endpoint

---

## 🔮 Planned & In Progress

| Feature | Status | Description |
| :--- | :--- | :--- |
| **Real-time Updates** | 🟡 Planned | WebSocket (Socket.io) integration for live campaign counters, donation notifications, and direct messaging |
| **Communities** | 🟡 Planned | Dedicated community spaces for campaign backers with threaded discussions |
| **KYC Document Upload** | 🟡 Planned | File upload flow for identity verification documents |
| **Campaign Media Uploads** | 🟡 Planned | Image/video upload support for campaigns and posts (S3 or Cloudinary) |
| **Email Notifications** | 🟡 Planned | Transactional emails for signup confirmation, donation receipts, and campaign updates |
| **Search & Discovery** | 🟡 Planned | Full-text search across campaigns and users |
| **Achievements & Badges** | 🔵 Future | Gamified milestones for top backers and active creators |
| **AI Campaign Drafting** | 🔵 Future | AI-assisted campaign description and goal-setting |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20
- PostgreSQL database (local or hosted)
- Stripe account (for payment testing)

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/PERN-Funding-App.git
cd PERN-Funding-App

# Backend setup
cd backend
npm install
npx prisma generate
npm start              # Starts on port 8080

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev            # Starts on port 5173
```

### Docker (Full Stack)

```bash
docker-compose up --build
# Frontend → http://localhost:80
# Backend  → http://localhost:8080
```

### Environment Variables

Both `frontend/.env` and `backend/.env` are required. Refer to the respective README files for the complete list of required variables.

---

## 📁 Detailed Documentation

| Document | Description |
| :--- | :--- |
| [Frontend README](./frontend/README.md) | React app architecture, component structure, routing, and local setup |
| [Backend README](./backend/README.md) | API endpoints, database schema, authentication flow, and server configuration |

---

## 📄 License

This project is developed as a **Final Year Project (FYP)** for academic purposes.
