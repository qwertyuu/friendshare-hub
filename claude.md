# FriendShare Hub - Project Overview

## Project Summary

**FriendShare Hub** (Raphartage Club) is a full-stack web application for item sharing and borrowing within a community. Built with React, Express.js, PostgreSQL, and Prisma, it enables users to list items they're willing to share and request to borrow items from others.

**Repository**: H:\GitHub\friendshare-hub
**Type**: Monorepo (npm workspaces)
**Architecture**: Traditional three-tier (Frontend SPA + Backend API + PostgreSQL DB)

---

## 📂 Project Structure

```
friendshare-hub/
├── frontend/              # React + Vite + TypeScript SPA
├── backend/               # Express.js + Prisma API
├── shared/                # Shared validation schemas
├── .github/               # CI/CD workflows
├── .claude/               # Claude configuration
├── docker-compose.yml     # Container orchestration
├── package.json           # Workspace configuration
└── README.md              # Main documentation
```

---

## 🔑 Core Technologies

### Frontend
- **Framework**: React 18 + Vite 5 + TypeScript 5
- **Styling**: Tailwind CSS + shadcn-ui (45+ pre-built Radix UI components)
- **State Management**: TanStack React Query (data fetching), React Context (auth)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **Additional**: Sonner (toasts), Embla Carousel, Recharts
- **Port**: 8080 (dev) / 80 (Nginx prod)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.21
- **Database**: PostgreSQL 15 + Prisma ORM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Zod
- **Port**: 3000

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (production frontend)
- **Database**: PostgreSQL 15 with persistent volumes

---

## 🏗️ Architecture Overview

### Database Models

1. **User**: Authentication, roles (USER/ADMIN), approval status (PENDING/APPROVED/REJECTED)
2. **Item**: Products for sharing with categories, availability status, images
3. **ItemImage**: Multiple images per item with display ordering
4. **BorrowRequest**: Requests to borrow items with approval/rejection workflow
5. **GeneralRequest**: Broader requests for items (not specific to inventory)
6. **GeneralRequestResponse**: Responses to general requests with potential matches

### Key Features

- **User Management**: Registration → Approval workflow → Dashboard access
- **Item Management**: Create, edit, delete items with multiple images
- **Borrowing System**: Request items → Owner approves/rejects → Track borrow status
- **General Requests**: Post "wanted" items → Others respond with offers
- **Admin Panel**: User approval management
- **Image Gallery**: Upload and manage multiple images per item

### API Routes

| Endpoint | Purpose |
|----------|---------|
| `/api/auth/*` | Login, register, logout, session |
| `/api/items/*` | CRUD operations for items |
| `/api/items/:id/images/*` | Image upload, delete, reorder |
| `/api/requests/*` | Borrow request management |
| `/api/generalRequests/*` | General request/response system |
| `/api/admin/*` | User approval management |

---

## 🔐 Security Features

- **JWT Authentication** with httpOnly cookies
- **Password Hashing** with bcrypt (cost factor 10)
- **CORS** with origin whitelist
- **HTTP Security Headers** via Helmet
- **Rate Limiting** on auth endpoints
- **Input Validation** with Zod schemas (shared between frontend/backend)
- **SQL Injection Protection** via Prisma ORM

---

## 📦 Shared Code

**Location**: `shared/validation.ts`

Contains Zod validation schemas used by both frontend and backend:
- `registerSchema`, `loginSchema`
- `createItemSchema`, `updateItemSchema`
- `createRequestSchema`, `approveRequestSchema`, `rejectRequestSchema`
- `reorderImagesSchema`
- TypeScript type exports for all schemas

---

## 🚀 Getting Started

### Development

```bash
# Install dependencies
npm install

# Start frontend + backend concurrently
npm run dev

# Or individually:
npm run dev:frontend  # http://localhost:8080
npm run dev:backend   # http://localhost:3000
```

### Database

```bash
# Create migration
npm run db:migrate

# Seed with sample data
npm run db:seed

# Open Prisma Studio GUI
npm run db:studio
```

### Docker

```bash
# Build and run full stack
docker-compose up

# Access:
# Frontend: http://localhost
# Backend: http://localhost:3000
# PostgreSQL: localhost:5432
```

### Build for Production

```bash
npm run build
```

---

## 🔗 Key File Locations

### Configuration
- Frontend config: `frontend/vite.config.ts`, `frontend/tailwind.config.ts`, `frontend/tsconfig.json`
- Backend config: `backend/tsconfig.json`, `backend/src/config/env.ts`
- Database schema: `backend/prisma/schema.prisma`
- Docker: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`

### Source Code
- Frontend pages: `frontend/src/pages/`
- Frontend components: `frontend/src/components/`
- Backend controllers: `backend/src/controllers/`
- Backend routes: `backend/src/routes/`
- Backend middleware: `backend/src/middleware/`

---

## 📝 Development Workflow

1. **Frontend**: Changes in `frontend/src/` hot-reload on port 8080
2. **Backend**: Changes in `backend/src/` auto-restart dev server on port 3000
3. **Database**: Modify `backend/prisma/schema.prisma` then run migrations
4. **Shared Validation**: Update `shared/validation.ts` for both frontend/backend changes

---

## 📚 Key Patterns

- **Component-Based UI**: Reusable React components in `components/`
- **REST API**: Express routes with controllers and services
- **ORM Queries**: Prisma client for type-safe database access
- **Client State**: React Context for auth, React Query for API data
- **Form Validation**: React Hook Form with Zod schemas
- **Error Handling**: Custom error classes in `backend/utils/errors.ts`

---

## 🐛 Common Tasks

### Adding a New Endpoint
1. Update database schema in `backend/prisma/schema.prisma` if needed
2. Create migration: `npm run db:migrate`
3. Add controller in `backend/src/controllers/`
4. Add routes in `backend/src/routes/`
5. Create frontend API call in service
6. Build UI component using React Query

### Adding a New Page
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link in header component
4. Create API service calls in `frontend/src/services/`

### Updating Validation
1. Modify schema in `shared/validation.ts`
2. Update both frontend and backend to use new schema
3. TypeScript will catch type mismatches automatically

---

## 🔗 Related Documentation

- **Frontend Guide**: See `frontend/claude.md` for detailed frontend architecture
- **Backend Guide**: See `backend/claude.md` for detailed backend architecture
- **Main README**: See `README.md` for user-facing documentation

---

## 📊 Project Stats

- **Monorepo Size**: ~2000+ lines of application code
- **React Components**: 50+ UI components (shadcn-ui library + custom)
- **API Endpoints**: 20+ REST endpoints
- **Database Tables**: 6 core tables with relationships
- **TypeScript Coverage**: 100% (strict mode)
- **Code Organization**: Modular by feature/domain

---

## 🎯 Next Steps / TODOs

- Review `TESTING_BUG_REPORT.md` for known issues
- Check `.claude/settings.local.json` for personalized configuration
- Review GitHub workflows in `.github/workflows/` for CI/CD setup

