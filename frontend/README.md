# Frontend# ⚛️ FundMe — Frontend Client

A high-performance, responsive React Single Page Application (SPA) powerering the **FundMe** crowdfunding and social engagement platform. Built with **React 19**, **TypeScript**, **Vite (Rolldown)**, and **TailwindCSS v4**.

---

## 📋 Table of Contents

- [⚙️ Tech Stack & Dependencies](#️-tech-stack--dependencies)
- [📂 Project Structure](#-project-structure)
- [🔒 Authentication & Route Guards](#-authentication--route-guards)
- [🎨 UI Components & Pages](#-ui-components--pages)
- [💳 Stripe Payment Integration](#-stripe-payment-integration)
- [⚡ Feature Architecture & API Adapters](#-feature-architecture--api-adapters)
- [🔑 Environment Variables](#-environment-variables)
- [🚀 Quick Start & Scripts](#-quick-start--scripts)
- [🐳 Docker & Nginx Deployment](#-docker--nginx-deployment)

---

## ⚙️ Tech Stack & Dependencies

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Modern component-based UI layer |
| **Language** | [TypeScript 6](https://www.typescriptlang.org/) | Static type safety and developer tooling |
| **Build Tool** | [Vite](https://vitejs.dev/) (`rolldown-vite`) | Next-generation bundler and lightning-fast HMR |
| **Styling** | [TailwindCSS v4](https://tailwindcss.com/) | Utility-first CSS framework with native `@import` |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) | Client-side routing with nested layouts & route guards |
| **Payments** | [@stripe/react-stripe-js](https://stripe.com/) | Secure checkout components & Payment Element |
| **Icons** | [Lucide React](https://lucide.dev/) | Modern, lightweight SVG icon library |
| **Notifications** | [React Toastify](https://fkhadra.github.io/react-toastify/) | Customizable toast alerts and notifications |

---

## 📂 Project Structure

```text
frontend/
├── public/                           # Static public assets (favicon, logos)
├── src/
│   ├── assets/                       # Global images, SVGs, and brand graphics
│   │
│   ├── components/                   # Core shared UI components & utilities
│   │   ├── ChatWidget.jsx            # Floating AI/community chat widget interface
│   │   ├── CheckoutForm.tsx          # Stripe Payment Element checkout form component
│   │   ├── DonationModal.tsx         # Campaign backing modal with custom amount selection
│   │   ├── FollowButton.tsx          # Interactive follow/unfollow toggle button
│   │   ├── FollowListModal.tsx       # Followers & Following users modal list
│   │   ├── MinimalToast.tsx          # Compact custom notification banner
│   │   ├── RouteGuards.jsx           # PublicRoute, PrivateRoute, and RoleRoute guards
│   │   └── ScrollLock.jsx            # Body scroll prevention hook for open modals
│   │
│   ├── features/                     # Feature-specific state, custom hooks & API clients
│   │   ├── comments/                 # Polymorphic comment fetch adapters & handlers
│   │   ├── creator/                  # Creator campaign creation & management API adapters
│   │   ├── likes/                    # Polymorphic like/react API integration
│   │   ├── Posts/                    # Social feed posts CRUD & infinite feed adapters
│   │   └── profile/                  # User profile stats and dynamic tab state logic
│   │
│   ├── pages/                        # Page views organized by domain area
│   │   ├── Admin/
│   │   │   └── AdminDashboard.jsx    # User management, role elevation & KYC verification
│   │   ├── Auth/
│   │   │   ├── Login.jsx             # JWT authentication login modal
│   │   │   └── Signup.jsx            # User registration modal with validation
│   │   ├── CreatorDashboard/
│   │   │   ├── Campaigns.jsx         # Fundraiser campaign control panel & stats
│   │   │   └── CreateCampaignModal.tsx # Multi-step campaign launch modal form
│   │   ├── Detail/
│   │   │   ├── CampaignDetail.tsx    # Campaign view, progress bar, backer list & comments
│   │   │   ├── CommentSection.tsx    # Shared polymorphic comment thread UI
│   │   │   └── PostDetail.tsx        # Individual social post deep-dive view
│   │   ├── Feed/
│   │   │   ├── FeedMain.tsx          # Main social feed page wrapper layout
│   │   │   └── components/
│   │   │       ├── CreateThreadModal.tsx # Rich text campaign update & post creation
│   │   │       ├── Feed.tsx          # Paginated stream of posts and campaigns
│   │   │       ├── FeedCard.tsx      # Social post & campaign card component
│   │   │       ├── ImageFallback/    # Graceful image loading error handling
│   │   │       ├── Navbar.tsx        # Top navigation bar with profile menu & CTA
│   │   │       ├── RightSidebar.tsx  # Trending campaigns & community suggestions
│   │   │       └── Sidebar.tsx       # Primary navigation drawer & filter links
│   │   ├── Home/
│   │   │   └── LandingMain.tsx       # High-converting public landing page for visitors
│   │   ├── KYC/
│   │   │   └── KYCVerification.tsx   # Fundraiser identity verification application form
│   │   └── Profile/
│   │       ├── ProfileFeed.tsx       # User posts, campaigns, backed projects & activity tabs
│   │       ├── ProfileView.tsx       # Dynamic route handler for `/user/:username`
│   │       ├── RightCard.tsx         # Profile quick-stats and summary panel
│   │       ├── RootLayout.tsx        # Shared layout wrapper for profile subroutes
│   │       └── UserHome.tsx          # User profile overview index view
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx             # Master React Router v7 configuration & guard mapping
│   │
│   ├── App.jsx                       # Root React component managing token sync
│   ├── RefreshHandler.tsx            # Session persistence & localStorage synchronization
│   ├── index.css                     # Global TailwindCSS v4 imports and theme settings
│   ├── main.jsx                      # React 19 root entry point
│   ├── utils.ts                      # Reusable API wrappers, formatting helpers & toasts
│   └── vite-env.d.ts                 # TypeScript environment declarations
│
├── .env                              # Local environment variables
├── Dockerfile                        # Multi-stage Nginx Docker container setup
├── eslint.config.js                  # ESLint configuration
├── index.html                        # HTML5 document template
├── nginx.conf                        # Nginx web server configuration for production builds
├── package.json                      # Project dependencies & scripts
├── tsconfig.json                     # TypeScript compiler configuration
└── vite.config.js                    # Vite bundler configuration
```

---

## 🔒 Authentication & Route Guards

The app implements client-side access control via three custom route wrappers (`src/components/RouteGuards.jsx`):

1. **`PublicRoute`**: Accessible only to unauthenticated visitors. Redirects logged-in users to their role default page (`/feed` or `/admin/dashboard`).
2. **`PrivateRoute`**: Protects pages requiring active authentication (e.g., `/feed`, `/campaigns/:id`, `/posts/:id`, `/user/:username`, `/kyc-verification`).
3. **`RoleRoute`**: Enforces strict Role-Based Access Control (RBAC). Only users with matching roles can access specific views:
   - **`admin`**: Access to `/admin/dashboard`, `/creator/dashboard`, `/create-campaign`.
   - **`fundraiser`**: Access to `/creator/dashboard`, `/create-campaign`.
   - **`user`**: Access to community feed, campaign backing, KYC application.

---

## 🎨 UI Components & Pages

### Key Workflows & Views

- **Public Landing (`/`)**: Highlighting platform mission, featured campaigns, and background stories with call-to-action buttons for modal login (`/login`) and registration (`/signup`).
- **Community Feed (`/feed`)**: Unified social discovery feed combining creator campaign announcements and backer posts. Features infinite scrolling, like toggles, comment threads, and quick campaign backing.
- **Campaign Detail (`/campaigns/:id`)**: Comprehensive view showing funding progress bar, target deadline, creator verification status, full description, backer history, and embedded comment thread.
- **Stripe Backing Flow (`DonationModal.tsx` & `CheckoutForm.tsx`)**: Modal overlay allowing backers to select quick preset amounts or custom funding. Integrates Stripe Payment Element with auto-retry and confirmation feedback.
- **User Profile (`/user/:username`)**: User activity hub displaying follower counts, campaigns launched, total funds raised/contributed, and timeline of posts.
- **Creator Dashboard (`/creator/dashboard`)**: Dedicated management suite for fundraisers to track total funds raised, view active vs. completed campaigns, and trigger fresh campaign launches.
- **Admin Panel (`/admin/dashboard`)**: Administrative console for managing user roles, inspecting platform statistics, and approving/toggling KYC verification for creator applications.

---

## 💳 Stripe Payment Integration

FundMe utilizes **Stripe React SDK (`@stripe/stripe-js`)** for secure, PCI-compliant card processing:

1. Backer initiates donation on `CampaignDetail` or `FeedCard`.
2. Frontend calls `/api/payments/create-intent` with `campaignId` and `amount`.
3. Backend returns a Stripe `clientSecret`.
4. Frontend initializes `<Elements stripe={stripePromise} options={{ clientSecret }}>`.
5. User confirms payment via `<CheckoutForm />`.
6. Upon successful Stripe client confirm, frontend posts to `/api/payments/confirm` to update campaign progress in real time.

---

## ⚡ Feature Architecture & API Adapters

The application uses modular feature adapters inside `src/features/`:

- **API Utilities (`src/utils.ts`)**: Centralized `fetch` wrapper handling Authorization header formatting (`Bearer <token>`), dynamic `VITE_BASE_API_URL` configuration, and response validation.
- **Notification Utility**: Standardized `toast` wrappers powered by `react-toastify` for error, success, and info alerts.
- **Session Sync (`RefreshHandler.tsx`)**: Re-evaluates JWT existence in `localStorage` on page refresh or browser reload to preserve active sessions without flicker.

---

## 🔑 Environment Variables

Create a `.env` file in the root of the `frontend/` folder:

```env
# Stripe Publishable Key (Stripe Dashboard -> API Keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY

# Backend REST API URL
# Local Development: http://localhost:8080
# Production: https://your-api-gateway-or-server.com
VITE_BASE_API_URL=http://localhost:8080
```

---

## 🚀 Quick Start & Scripts

### Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### Available Development Scripts

```bash
# Start local Vite development server (hot-reload on port 5173)
npm run dev

# Run TypeScript checking and build production bundle into dist/
npm run build

# Preview production build locally
npm run preview

# Run ESLint code style check
npm run lint
```

---

## 🐳 Docker & Nginx Deployment

The frontend includes a multi-stage `Dockerfile` and custom `nginx.conf` for optimized production deployment:

### Build & Run Container

```bash
# Build frontend image
docker build -t fundme-frontend .

# Run container on port 80
docker run -d -p 80:80 --name fundme-frontend-container fundme-frontend
```

### Nginx Configuration Highlights

- **Single Page Application Routing**: Automatically routes all unknown paths (`try_files $uri $uri/ /index.html`) to support client-side React Router navigation.
- **Asset Caching**: Configured headers for static assets (`.js`, `.css`, images).

