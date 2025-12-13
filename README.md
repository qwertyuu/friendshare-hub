# Raphartage Club - Full Stack Application

A comprehensive item sharing and borrowing platform built with modern web technologies.

## 📁 Project Structure

This is a monorepo with the following structure:

```
raphartage-club/
├── frontend/              # React + Vite + shadcn-ui frontend
├── backend/               # Node.js + Express + PostgreSQL backend
├── shared/                # Shared types and validation schemas
└── package.json           # Root workspace configuration
```

## 🎯 Features

### Frontend
- User authentication and authorization
- Item management (create, list, view details)
- Image upload and gallery
- Borrow request system
- Admin approval workflow
- Responsive design with Tailwind CSS

### Backend
- RESTful API with Express.js
- PostgreSQL database with Prisma ORM
- JWT-based authentication
- File upload handling with Multer
- Admin user management
- Rate limiting and security headers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. Clone and install dependencies:
```bash
# Install root dependencies
npm install

# Install both frontend and backend dependencies
npm install --workspaces
```

2. Set up environment variables:

**Backend** (`backend/.env`):
```bash
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8080
DATABASE_URL=postgresql://user:password@localhost:5432/raphartage_club
JWT_SECRET=your-secret-key-min-32-chars
ADMIN_EMAIL=admin@example.com
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_URL=http://localhost:3000
```

3. Set up the database:
```bash
npm run db:migrate
npm run db:seed
```

4. Start both frontend and backend:
```bash
npm run dev
```

Or run them separately:
```bash
npm run dev:frontend   # Frontend on http://localhost:8080
npm run dev:backend    # Backend on http://localhost:3000
```

## 📚 Documentation

### Frontend
- See [`frontend/README.md`](./frontend) for frontend setup and development

### Backend
- See [`backend/README.md`](./backend) for API documentation and backend setup

### Shared Code
- [`shared/validation.ts`](./shared/validation.ts) - Zod validation schemas

## 🛠️ Development Commands

### Root Level Commands
```bash
# Start both frontend and backend concurrently
npm run dev

# Build both frontend and backend
npm run build

# Database commands
npm run db:migrate      # Create database migration
npm run db:push         # Push schema to database
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database with sample data
npm run db:reset        # Reset and reseed database
```

### Frontend Only
```bash
npm run dev:frontend    # Start frontend dev server
npm run build:frontend  # Build frontend
```

### Backend Only
```bash
npm run dev:backend     # Start backend dev server with hot reload
npm run build:backend   # Build backend
```

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn-ui / Radix UI
- **Routing**: React Router 6
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Validation**: Zod

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Zod

## 🔐 Authentication Flow

1. **Register**: New users register with email, password, and name
2. **Pending Approval**: Accounts start in PENDING status
3. **Admin Approval**: Admin users review and approve/reject registrations
4. **Login**: Approved users can login with JWT token
5. **Session**: JWT token stored in httpOnly cookie for security

## 📊 Database Schema

The database includes:
- **Users**: Authentication and profile management
- **Items**: Shareable items with metadata
- **ItemImages**: Images associated with items
- **BorrowRequests**: Borrowing request lifecycle

See `backend/prisma/schema.prisma` for detailed schema.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - List items with pagination
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create new item
- `PATCH /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Images
- `POST /api/items/:itemId/images` - Upload images
- `DELETE /api/items/:itemId/images/:imageId` - Delete image
- `PATCH /api/items/:itemId/images/reorder` - Reorder images

### Borrow Requests
- `GET /api/requests` - Get my requests
- `GET /api/demands` - Get requests for my items
- `POST /api/requests` - Create request
- `PATCH /api/requests/:id/approve` - Approve request
- `PATCH /api/requests/:id/reject` - Reject request
- `PATCH /api/requests/:id/complete` - Complete request

### Admin
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:id/approve` - Approve user
- `PATCH /api/admin/users/:id/reject` - Reject user

## 🔒 Security

- Password hashing with bcrypt
- JWT authentication with secure cookies
- CORS with origin whitelist
- Rate limiting on auth endpoints
- Helmet security headers
- Input validation with Zod
- SQL injection protection via Prisma

## 📝 Project Structure

```
raphartage-club/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── App.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   ├── config/         # Configuration
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
│
├── shared/
│   └── validation.ts       # Shared Zod schemas
│
└── package.json            # Root workspace config
```

## 🚀 Deployment

### Prerequisites for Production
- PostgreSQL 15+ instance
- Node.js 18+ runtime
- Environment variables configured
- HTTPS/SSL certificate

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=long-random-string-min-32-chars
CORS_ORIGIN=https://yourdomain.com
# ... other variables
```

## 📞 Support

For issues and questions:
1. Check the [Backend README](./backend/README.md)
2. Check the [Frontend README](./frontend)
3. Review Prisma [documentation](https://www.prisma.io/docs)
4. Review Express [documentation](https://expressjs.com/)

## 📄 License

MIT License

## 🎉 Ready to Use!

The project is fully set up and ready for development. Start with:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Then visit:
- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- API Docs: Check `backend/README.md` for endpoint documentation
