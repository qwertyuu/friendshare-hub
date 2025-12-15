# Frontend - React + Vite Architecture Guide

## Overview

**FriendShare Hub Frontend** is a modern React single-page application (SPA) built with Vite, TypeScript, and Tailwind CSS. It provides the user interface for browsing items, managing borrow requests, and managing user profiles.

**Location**: `H:\GitHub\friendshare-hub\frontend`
**Port (Dev)**: 8080 (Vite dev server)
**Port (Prod)**: 80 (Nginx reverse proxy)
**Build Tool**: Vite 5.4
**Framework**: React 18.3
**Styling**: Tailwind CSS + shadcn-ui

---

## 📂 Directory Structure

```
frontend/src/
├── components/
│   ├── admin/              # Admin-specific components
│   │   └── UserApprovalList.tsx
│   ├── common/             # Reusable common components
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── generalRequests/    # General request UI components
│   │   ├── CreateGeneralRequest.tsx
│   │   └── ResponseList.tsx
│   ├── items/              # Item management components
│   │   ├── ItemCard.tsx
│   │   ├── ItemForm.tsx
│   │   ├── ItemGallery.tsx
│   │   └── ItemDetails.tsx
│   ├── layout/             # Layout components
│   │   └── Header.tsx      # Navigation header with user menu
│   ├── requests/           # Borrow request components
│   │   ├── RequestCard.tsx
│   │   ├── RequestForm.tsx
│   │   └── RequestList.tsx
│   ├── ui/                 # shadcn-ui component library
│   │   ├── button.tsx      # 45+ reusable UI components
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── pagination.tsx
│   │   └── ... (many more)
│   ├── NavLink.tsx         # Custom routing link component
│   └── [page-specific]     # Feature-specific components
├── context/
│   └── AuthContext.tsx     # Authentication state + user info
├── hooks/
│   ├── use-mobile.tsx      # Mobile breakpoint detection
│   └── use-toast.ts        # Toast notification system
├── lib/
│   ├── categories.ts       # Item category definitions
│   └── utils.ts            # Utility functions (cn, date formatting)
├── pages/
│   ├── Index.tsx           # Home/landing page
│   ├── Login.tsx           # Login page
│   ├── Register.tsx        # Registration page
│   ├── Browse.tsx          # Browse items with filters
│   ├── MyItems.tsx         # User's item management
│   ├── Requests.tsx        # Outgoing borrow requests
│   ├── GeneralRequests.tsx # General requests listing
│   ├── Demands.tsx         # Incoming borrow requests
│   └── NotFound.tsx        # 404 page
├── services/
│   ├── api.ts              # Axios API client configuration
│   └── [service files]     # API service functions
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Root component with routing
├── App.css                 # Global styles
├── index.css               # Tailwind directives
├── main.tsx                # React DOM entry point
├── vite-env.d.ts           # Vite type definitions
└── [root files]            # Configuration files
```

---

## 🔧 Configuration Files

### vite.config.ts
- React plugin for JSX transformation
- Development server on port 8080
- Build optimizations for production
- API proxy configuration (if needed)

### tailwind.config.ts
- Color scheme customization
- Custom animations and transitions
- Typography settings
- Dark mode support (ready for implementation)
- Plugin extensions

### tsconfig.json
- Strict mode enabled
- Path alias `@/*` for imports from `src/`
- ES2020 target
- DOM library for React types

### components.json
- shadcn-ui registry configuration
- Component aliases and paths
- TypeScript component generation

### vite-env.d.ts
- Type definitions for Vite environment variables
- Ensures IDE autocomplete for `import.meta.env`

### index.html
- HTML entry point with `<div id="root">`
- Script reference to `main.tsx`
- Favicon and meta tags

---

## 🎨 Component Architecture

### Component Hierarchy

```
App
├── Header (Navigation)
├── Routes
│   ├── Index (Home)
│   ├── Login
│   ├── Register
│   ├── ProtectedRoute (requires auth)
│   │   ├── Browse (ItemCard, ItemGallery)
│   │   ├── MyItems (ItemForm, ItemCard)
│   │   ├── Requests (RequestCard, RequestList)
│   │   ├── Demands (RequestCard, RequestList)
│   │   ├── GeneralRequests
│   │   └── AdminPanel (UserApprovalList)
│   └── NotFound
└── ToastProvider (Sonner)
```

### Component Categories

#### Common Components (`components/common/`)
- `LoadingSpinner`: Loading state UI
- `ProtectedRoute`: Auth guard wrapper
- `ErrorBoundary`: Error catching
- Other shared utilities

#### UI Components (`components/ui/`)
Shadcn-ui components provide:
- Buttons, inputs, forms, dialogs
- Tables, cards, tabs, pagination
- Dropdowns, notifications, modals
- Date pickers, selects, checkboxes
- All styled with Tailwind, fully accessible

#### Feature Components
- **Items** (`components/items/`): ItemCard, ItemForm, ItemGallery, ItemDetails
- **Requests** (`components/requests/`): RequestCard, RequestForm, RequestList
- **General Requests** (`components/generalRequests/`): Create, response listing
- **Admin** (`components/admin/`): User approval management
- **Layout** (`components/layout/`): Header navigation

---

## 🔐 Authentication & State Management

### AuthContext (`context/AuthContext.tsx`)
- Stores current user data
- Manages authentication state
- Provides login/logout functions
- Persists user session
- Wrapped at root level for global access

```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}
```

### Protected Routes
- `ProtectedRoute` component checks auth status
- Redirects to login if not authenticated
- Prevents unauthorized access to pages

---

## 🌐 API Integration

### API Client (`services/api.ts`)
- Axios instance configured with base URL
- Automatic token injection in headers
- Error handling and interceptors
- Centralized API configuration

### Service Pattern
- API calls organized by domain (items, requests, auth)
- React Query hooks for data fetching
- Type-safe with TypeScript

### API Endpoints Used
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/items
POST   /api/items
GET    /api/items/:id
PATCH  /api/items/:id
DELETE /api/items/:id

POST   /api/items/:itemId/images
DELETE /api/items/:itemId/images/:imageId
PATCH  /api/items/:itemId/images/reorder

GET    /api/requests
POST   /api/requests
PATCH  /api/requests/:id/approve
PATCH  /api/requests/:id/reject
PATCH  /api/requests/:id/complete

GET    /api/requests/demands
POST   /api/generalRequests
GET    /api/generalRequests/:id/responses

PATCH  /api/admin/users/:id/approve
PATCH  /api/admin/users/:id/reject
```

---

## 🎯 Key Pages

### Index.tsx (Home)
- Landing page with project introduction
- Login/register buttons for unauthenticated users
- Dashboard overview for authenticated users

### Login.tsx & Register.tsx
- Form validation with React Hook Form + Zod
- Error handling and display
- Redirect to dashboard on success

### Browse.tsx
- Grid of available items
- Filter by category, search by title
- Item details modal or navigation
- Sorted by latest/most borrowed

### MyItems.tsx
- User's owned items listing
- Add new item form
- Edit item form
- Delete item with confirmation
- Image gallery management

### Requests.tsx
- Outgoing borrow requests
- Status tracking (PENDING, APPROVED, REJECTED, COMPLETED)
- Cancel request option
- Request details and timeline

### Demands.tsx
- Incoming borrow requests from others
- Approve/reject actions
- Mark as completed
- Request history

### GeneralRequests.tsx
- Browse general requests from other users
- Create new general request
- Respond to requests with specific items
- Track request status

---

## 🎨 Styling

### Tailwind CSS
- Utility-first CSS framework
- Configured in `tailwind.config.ts`
- Color scheme, spacing, typography customization
- Animation definitions for smooth transitions

### shadcn-ui
- Pre-built, accessible component library
- Built on Radix UI primitives
- Fully customizable Tailwind styling
- Copy-paste component model (not npm packages)
- ~45 components available

### Global Styles
- `index.css`: Tailwind directives and base styles
- `App.css`: App-specific styles
- Component-scoped styles via `className` prop

---

## 🛠️ Development Workflow

### Starting the Dev Server
```bash
npm run dev:frontend
# or from root with both services
npm run dev
```

Server runs on `http://localhost:8080` with hot module replacement (HMR)

### Building for Production
```bash
npm run build:frontend
```

Output in `frontend/dist/` directory ready for Docker/Nginx

### Code Quality
```bash
npm run lint  # ESLint
npm run type-check  # TypeScript
```

---

## 📊 State Management Strategy

### Global State (AuthContext)
- User authentication
- Current user information
- Login/logout actions

### Server State (React Query)
- Fetched item data
- Request data
- Cache management
- Background refetching

### Local State (useState, useReducer)
- Form inputs
- Modal visibility
- UI interactions
- Pagination state

### Best Practice
Use minimal global state, delegate data fetching to React Query, keep component state local

---

## 📦 Dependencies

### Core Framework
- `react` 18.3.1 - UI library
- `react-dom` 18.3.1 - DOM rendering
- `typescript` 5 - Type safety
- `vite` 5.4 - Build tool

### Styling & UI
- `tailwindcss` 3.4.17 - Utility CSS
- `@radix-ui/*` - Accessible components
- `lucide-react` 0.462.0 - Icons
- `class-variance-authority` - Component styling
- `clsx` - Class name utilities

### Routing & Forms
- `react-router-dom` 6.30.1 - SPA routing
- `react-hook-form` 7.61.1 - Form state
- `zod` 3.25.76 - Runtime validation

### Data Fetching & Async
- `@tanstack/react-query` 5.83.0 - Server state
- `axios` - HTTP client

### UI Enhancements
- `sonner` - Toast notifications
- `embla-carousel-react` - Image carousel
- `react-day-picker` - Date picker
- `recharts` 2.15.4 - Charts and graphs

### Development
- `eslint`, `prettier` - Code quality
- `@types/*` - TypeScript definitions

---

## 🔍 Key Utilities

### categories.ts
```typescript
export const ITEM_CATEGORIES = [
  'TOOLS',
  'KITCHEN',
  'SPORTS',
  'ELECTRONICS',
  'BOOKS',
  'GAMES',
  'CAMPING',
  'OTHER'
]
```

### utils.ts
- `cn()`: Tailwind class merging
- Date formatting helpers
- String utilities
- Object transformation helpers

---

## 🚀 Performance Optimization

### Code Splitting
- React Router lazy loading for pages
- Component-level code splitting via React.lazy()

### Image Optimization
- Lazy loading for item images
- Responsive image sizes
- WebP format support

### Caching
- React Query persistent cache
- HTTP caching headers from Nginx

### Bundle Size
- Tailwind CSS purging unused styles
- Tree-shaking of unused exports
- Vite optimized builds

---

## 🔗 Integration with Backend

### Environment Variables
```
VITE_API_BASE_URL=http://localhost:3000/api
```

Configured in `.env` files:
- `.env.development` - Dev server
- `.env.production` - Built app

### CORS
- Backend configured to accept requests from frontend origin
- Credentials (cookies) passed with requests

### Authentication Flow
1. User registers/logs in
2. Backend returns JWT in httpOnly cookie
3. Frontend stores user info in AuthContext
4. API client automatically includes cookie
5. Protected routes check auth status

---

## 📝 Development Tips

### Adding a New Feature
1. Create page in `pages/` or component in `components/`
2. Add route to `App.tsx`
3. Create API service functions
4. Use React Query for data fetching
5. Style with Tailwind + shadcn-ui components
6. Add validation with Zod schemas (from `shared/`)

### Debugging
- React DevTools browser extension
- Network tab for API calls
- Console logs for state tracking
- Type checking with TypeScript

### Code Organization
- One component per file (mostly)
- Export component as default
- Co-locate related logic
- Use descriptive names
- Keep components small and focused

---

## 🐛 Common Issues & Solutions

### API Calls Not Working
- Check `VITE_API_BASE_URL` in `.env`
- Verify backend is running on port 3000
- Check network tab for CORS errors
- Ensure authentication token is valid

### Styling Not Applied
- Check Tailwind CSS build process
- Verify shadcn-ui components are installed correctly
- Clear `node_modules` and rebuild if needed
- Check CSS specificity and class names

### Hot Module Replacement (HMR) Not Working
- Restart Vite dev server
- Check for syntax errors in modified file
- Ensure file is saved correctly

---

## 📖 Related Documentation

- **Root Project Guide**: See `../claude.md` for full project overview
- **Backend Guide**: See `../backend/claude.md` for API details
- **Vite Documentation**: https://vitejs.dev
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn-ui**: https://ui.shadcn.com

