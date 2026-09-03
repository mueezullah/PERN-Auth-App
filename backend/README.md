# ⚡ FundMe — Backend REST API

The core backend REST API service for **FundMe** crowdfunding and social engagement platform. Powered by **Node.js**, **Express v5**, **PostgreSQL**, **Prisma ORM**, and **Stripe SDK**.

---

## 📋 Table of Contents

- [⚙️ Tech Stack & Dependencies](#️-tech-stack--dependencies)
- [📂 Project Structure](#-project-structure)
- [🗄️ Database Architecture & Hybrid Strategy](#️-database-architecture--hybrid-strategy)
- [🔒 Authentication & Authorization](#-authentication--authorization)
- [💳 Stripe Payment & Webhook Architecture](#-stripe-payment--webhook-architecture)
- [📡 API Endpoint Reference](#-api-endpoint-reference)
- [🔑 Environment Variables](#-environment-variables)
- [🚀 Local Development & Database Setup](#-local-development--database-setup)
- [☁️ Serverless & Cloud Deployment](#️-serverless--cloud-deployment)

---

## ⚙️ Tech Stack & Dependencies

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Runtime & Server** | Node.js (≥20) + Express v5 | Modern ES Modules REST API server |
| **Database** | PostgreSQL (Neon Postgres) | Cloud relational database with connection pooling |
| **ORM** | Prisma ORM 5 | Type-safe query building & database migration management |
| **Database Driver** | `pg` (`node-postgres`) | Direct SQL pool client for ACID financial transactions |
| **Payments** | Stripe SDK | PaymentIntent creation, confirmation & webhook signature handling |
| **Security** | JWT + bcrypt | Token-based stateless authentication & password hashing |
| **Validation** | Joi | Declarative request payload validation middleware |
| **Serverless Deployment**| `serverless-http` | AWS Lambda & API Gateway deployment wrapper |

---

## 📂 Project Structure

```text
backend/
├── prisma/
│   └── schema.prisma                # Database models, relations, indexes & provider setup
│
├── src/
│   ├── config/                      # Configuration modules
│   │   ├── db.js                    # Dual DB setup: Prisma Client instance & pg Pool export
│   │   └── env.js                   # Centralized environment variable validation
│   │
│   ├── middlewares/                 # Global Express middlewares
│   │   ├── authenticate.js          # JWT token decoding & context attachment
│   │   ├── authorize.js             # Dynamic role-based authorization check
│   │   └── errorHandler.js          # Global unhandled error & exception handler
│   │
│   ├── modules/                     # Feature-based modular architecture
│   │   ├── auth/                    # Authentication & Admin User Management
│   │   │   ├── auth.controller.js   # Login, signup, role updates, KYC toggles
│   │   │   ├── auth.middleware.js   # JWT guards (`ensureAuthenticated`, `ensureAdmin`)
│   │   │   ├── auth.routes.js       # Router mapping for `/api/auth`
│   │   │   ├── auth.service.js      # Password hashing, JWT signing & user lookup logic
│   │   │   └── auth.validation.js   # Joi schemas for signup & login payloads
│   │   │
│   │   ├── campaigns/               # Funding Campaign Management
│   │   │   ├── campaign.controller.js # CRUD handlers, goal calculations & soft deletes
│   │   │   ├── campaign.model.js    # Raw SQL transaction helpers for atomic updates
│   │   │   ├── campaign.routes.js   # Router mapping for `/api/campaigns`
│   │   │   ├── campaign.service.js  # Campaign business logic & status transitions
│   │   │   └── campaign.validation.js # Joi schemas for campaign creation & edits
│   │   │
│   │   ├── comments/                # Polymorphic Comments System
│   │   │   ├── comment.controller.js# List, create & delete comments for posts/campaigns
│   │   │   └── comment.routes.js    # Router mapping for `/api/comments`
│   │   │
│   │   ├── follows/                 # Social Follow/Unfollow Network
│   │   │   ├── follow.controller.js # Toggle follow, status, followers/following lists
│   │   │   └── follow.routes.js     # Router mapping for `/api/follows`
│   │   │
│   │   ├── likes/                   # Polymorphic Reaction System
│   │   │   ├── like.controller.js   # Toggle likes & check like status on targets
│   │   │   └── like.routes.js       # Router mapping for `/api/likes`
│   │   │
│   │   ├── payments/                # Stripe Financial Transactions
│   │   │   ├── payments.controller.js # PaymentIntent creation, confirmation & webhooks
│   │   │   └── payments.route.js    # Router mapping for `/api/payments`
│   │   │
│   │   ├── posts/                   # Community Social Feed Posts
│   │   │   ├── post.controller.js   # Feed posts CRUD & user post history
│   │   │   └── post.routes.js       # Router mapping for `/api/posts`
│   │   │
│   │   └── users/                   # Public User Profiles
│   │       ├── user.controller.js   # Profile aggregation (stats, campaigns, backed projects)
│   │       └── user.routes.js       # Router mapping for `/api/users`
│   │
│   ├── utils/                       # Reusable helpers & utilities
│   │   ├── hash.js                  # Bcrypt hash and compare functions
│   │   ├── jwt.js                   # JWT sign and verify functions
│   │   └── pagination.js            # Unified page/limit query helper
│   │
│   ├── app.js                       # Express app configuration & raw body webhook handler
│   ├── dbInit.js                    # Auto database connection verification
│   ├── handler.js                   # Serverless Lambda handler entry point
│   ├── routes.js                    # Central API router mounting all modules
│   └── server.js                    # HTTP server entry point (port 8080)
│
├── .dockerignore
├── .env                             # Environment configuration file
├── Dockerfile                       # Production Node.js Docker container setup
├── package.json                     # Server dependencies & scripts
├── serverless.yml                   # AWS Serverless Framework configuration
└── tsconfig.json                    # TypeScript configuration for `tsx` dev server
```

---

## 🗄️ Database Architecture & Hybrid Strategy

FundMe employs a **hybrid database access strategy** leveraging both **Prisma ORM** and **`pg` Pool (Raw SQL)**:

### 1. Prisma ORM (`@prisma/client`)
Used across standard domain models (`User`, `Post`, `Comment`, `Like`, `Follow`, `Campaign`) for strong type safety, relational query building, auto-generated migrations, and indexing:

- **`User`**: Account identity, hashed passwords, roles (`user`, `fundraiser`, `admin`), KYC status.
- **`Campaign`**: Funding targets (`goal_amount`), current raised amount, deadline, status (`active`, `ended`, `completed`).
- **`Post`**: Social update timeline content.
- **`Donation`**: Transaction record linking donor to campaign with Stripe Intent tracking (`pending`, `succeeded`, `failed`, `refunded`).
- **`Comment`**: Polymorphic comments (`target_type`: `'post'` \| `'campaign'`).
- **`Like`**: Polymorphic likes (`target_type`: `'post'` \| `'campaign'`).
- **`Follow`**: Self-referential user follow network.

### 2. Raw SQL via `pg` Pool (`src/config/db.js`)
Used specifically in **`payments.controller.js`** and **`campaign.service.js`** for financial ledger integrity. Guarantees ACID compliance with explicit database transaction blocks (`BEGIN TRANSACTION`, `FOR UPDATE` locks, `COMMIT`, `ROLLBACK`) during Stripe donation fulfillment and refund processing.

---

## 🔒 Authentication & Authorization

Authentication is stateless and powered by **JSON Web Tokens (JWT)**:

1. **Token Generation**: Upon signup or login, backend issues a signed JWT containing `{ id, email, role }` valid for 24 hours.
2. **`ensureAuthenticated` Middleware**: Extracts `Bearer <token>` header, verifies signature via `JWT_SECRET`, and attaches `req.user` context.
3. **Role-Based Access Control (RBAC)**:
   - **`user`**: Standard platform user (can post, like, comment, follow, and back campaigns).
   - **`fundraiser`**: KYC-approved creator (can create and manage fundraising campaigns).
   - **`admin`**: System administrator (can change user roles, approve KYC applications, and manage platform resources).

---

## 💳 Stripe Payment & Webhook Architecture

FundMe handles funding through **Stripe PaymentIntents**:

```
[Backer Client] ──(1. POST /payments/create-intent)──> [Backend API]
                                                            │
                                                  (2. Create Stripe Intent)
                                                            │
[Backer Client] <──(3. Return Client Secret)───────── [Backend API]
       │
(4. Confirm Card via Stripe SDK)
       │
       ├───> [Backend API] (5. POST /payments/confirm) ──> [Atomic DB Ledger Update]
       │
       └───> [Stripe Webhook] ──> (6. POST /webhooks/stripe) ──> [Failsafe Sync]
```

### Stripe Webhook Safety Net (`/webhooks/stripe`)
- The webhook endpoint is mounted **before** standard `express.json()` middleware in `app.js` using `express.raw({ type: "application/json" })` to verify raw Stripe signature headers (`STRIPE_WEBHOOK_SECRET`).
- If a user closes their browser window during payment confirmation, the `payment_intent.succeeded` webhook automatically catches and fulfills the donation into PostgreSQL.

---

## 📡 API Endpoint Reference

### System Health
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status health check |

### 🔑 Authentication & Admin (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/users` | Admin | Get list of all registered users |
| `PUT` | `/api/auth/users/:id/role` | Admin | Update user role (`user`, `fundraiser`, `admin`) |
| `PUT` | `/api/auth/users/:id/kyc` | Admin | Toggle user KYC verification status |

### 👤 User Profiles (`/api/users`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/:username` | Public | Get public profile details & user activity stats |

### 🎯 Campaigns (`/api/campaigns`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/campaigns` | Public | List all active campaigns with pagination |
| `GET` | `/api/campaigns/:id` | Public | Get campaign details by ID |
| `GET` | `/api/campaigns/user/:userId` | Public | Get campaigns created by a specific user |
| `POST` | `/api/campaigns` | Auth | Create a new campaign (Fundraiser/Admin) |
| `PUT` | `/api/campaigns/:id` | Auth | Update existing campaign details (Owner only) |
| `DELETE` | `/api/campaigns/:id` | Auth | Soft-delete campaign & process refunds |

### 📝 Posts (`/api/posts`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | Fetch paginated main social feed posts |
| `GET` | `/api/posts/:id` | Public | Fetch single post by ID |
| `GET` | `/api/posts/user/:userId` | Public | Get all posts created by a specific user |
| `POST` | `/api/posts` | Auth | Create a new feed post |
| `PUT` | `/api/posts/:id` | Auth | Edit existing post (Author only) |
| `DELETE` | `/api/posts/:id` | Auth | Soft-delete post (Author only) |

### 💬 Comments (`/api/comments`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/comments?target_type=&target_id=` | Public | Fetch comments for a post or campaign |
| `POST` | `/api/comments` | Auth | Add a comment to a post or campaign |
| `DELETE` | `/api/comments/:id` | Auth | Delete a comment (Author only) |

### ❤️ Likes (`/api/likes`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/likes/toggle` | Auth | Toggle like state on a post or campaign |
| `GET` | `/api/likes/status?target_type=&target_id=` | Auth | Check if active user has liked target |

### 👥 Follows (`/api/follows`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/follows/:targetUserId/toggle` | Auth | Follow or unfollow a user |
| `GET` | `/api/follows/:targetUserId/status` | Optional | Check if logged-in user follows target |
| `GET` | `/api/follows/:userId/followers` | Public | Get list of followers for a user |
| `GET` | `/api/follows/:userId/following` | Public | Get list of users followed by target user |

### 💳 Payments (`/api/payments` & `/webhooks`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create-intent` | Auth | Create Stripe PaymentIntent for campaign backing |
| `POST` | `/api/payments/confirm` | Auth | Confirm donation and fulfill campaign ledger update |
| `POST` | `/api/payments/cleanup` | Auth | Expire stale pending donations older than 1 hour |
| `POST` | `/webhooks/stripe` | Stripe Signature | Failsafe webhook handler for payment events |

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Port
PORT=8080

# JWT Signing Key
JWT_SECRET=YourSuperSecretJWTKeyHere

# PostgreSQL Database Configuration (Neon PostgreSQL)
DB_HOST=ep-purple-boat-amkjk9zr-pooler.c-5.us-east-1.aws.neon.tech
DB_USER=neondb_owner
DB_PASSWORD=your_db_password
DB_NAME=neondb
DB_PORT=5432

# Prisma Database URL
DATABASE_URL="postgresql://neondb_owner:your_db_password@ep-purple-boat-amkjk9zr-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Stripe Secret Keys & Webhooks
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_STRIPE_WEBHOOK_SECRET

# Client Origin (CORS Configuration)
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Local Development & Database Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Prisma Database Generation & Migrations

```bash
# Generate Prisma Client code
npm run prisma:generate

# Sync schema with local/cloud PostgreSQL database
npx prisma db push
```

### 3. Start Development Server

```bash
# Starts hot-reloading server with nodemon + tsx on http://localhost:8080
npm start
```

---

## ☁️ Serverless & Cloud Deployment

The backend is configured for deployment to **AWS Lambda** via Serverless Framework (`serverless.yml`):

```bash
# Deploy to AWS Lambda stage
npx serverless deploy
```

