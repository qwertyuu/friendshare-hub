# Raphartage Club - Backend API

A comprehensive Node.js + Express + PostgreSQL backend for managing item sharing and borrowing requests.

## 🎯 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **User Approval System**: Admin approval workflow for new user registrations
- **Items Management**: Full CRUD operations for items with categorization
- **Image Upload**: Support for multiple image uploads per item
- **Borrow Requests**: Complete request lifecycle management (pending, approved, rejected, completed)
- **Admin Panel**: User management and approval system
- **Security**: Helmet for HTTP headers, CORS configuration, rate limiting, bcrypt for passwords

## 🏗️ Architecture

### Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Auth**: JWT + bcrypt

### Directory Structure

```
backend/
├── src/
│   ├── routes/              # Express routes
│   │   ├── auth.routes.ts
│   │   ├── items.routes.ts
│   │   ├── images.routes.ts
│   │   ├── requests.routes.ts
│   │   └── admin.routes.ts
│   ├── controllers/         # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── items.controller.ts
│   │   ├── images.controller.ts
│   │   ├── requests.controller.ts
│   │   └── admin.controller.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   └── storage.service.ts
│   ├── types/               # TypeScript definitions
│   │   └── express.d.ts
│   ├── config/              # Configuration files
│   │   ├── env.ts
│   │   └── database.ts
│   ├── utils/               # Utility functions
│   │   ├── errors.ts
│   │   └── logger.ts
│   └── server.ts            # Express app setup
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding
├── uploads/                 # File storage
├── .env                     # Environment variables
├── .env.example             # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the database:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Endpoints

### Authentication (`/api/auth`)

```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
GET    /api/auth/me                # Get current user profile
```

### Items (`/api/items`)

```
GET    /api/items                  # List items with pagination & filters
GET    /api/items/:id              # Get specific item with images
POST   /api/items                  # Create new item
PATCH  /api/items/:id              # Update item
DELETE /api/items/:id              # Delete item
```

### Images (`/api/items/:itemId/images`)

```
POST   /api/items/:itemId/images                # Upload images (multipart/form-data)
DELETE /api/items/:itemId/images/:imageId      # Delete image
PATCH  /api/items/:itemId/images/reorder       # Reorder images
```

### Borrow Requests (`/api/requests`, `/api/demands`)

```
GET    /api/requests                # Get my borrow requests
GET    /api/demands                 # Get requests for my items
POST   /api/requests                # Create borrow request
PATCH  /api/requests/:id/approve    # Approve request
PATCH  /api/requests/:id/reject     # Reject request
PATCH  /api/requests/:id/complete   # Mark as completed
```

### Admin (`/api/admin`)

```
GET    /api/admin/users             # List users with status filter
PATCH  /api/admin/users/:id/approve # Approve user
PATCH  /api/admin/users/:id/reject  # Reject user
```

## 🔐 Authentication

The backend uses JWT tokens stored in httpOnly cookies for secure authentication.

### Login Flow
1. User registers with email, password, and name
2. Account starts in PENDING status
3. Admin approves/rejects user
4. Approved users can login
5. Login returns JWT token in httpOnly cookie

### Protected Routes
Most routes require authentication (except register/login). Include the JWT token in requests, which is automatically sent as a cookie by the browser.

## 💾 Database Schema

### Users
- `id`: UUID primary key
- `email`: Unique email address
- `passwordHash`: Bcrypt hashed password
- `name`: User name
- `role`: USER or ADMIN
- `status`: PENDING, APPROVED, or REJECTED

### Items
- `id`: UUID primary key
- `ownerId`: Reference to User
- `title`: Item title
- `description`: Item description
- `category`: TOOLS, KITCHEN, SPORTS, ELECTRONICS, BOOKS, GAMES, CAMPING, OTHER
- `status`: AVAILABLE, BORROWED, UNAVAILABLE

### ItemImages
- `id`: UUID primary key
- `itemId`: Reference to Item
- `filePath`: Path to uploaded file
- `fileName`: Original filename
- `mimeType`: File MIME type
- `fileSize`: File size in bytes
- `displayOrder`: Display order

### BorrowRequests
- `id`: UUID primary key
- `itemId`: Reference to Item
- `requesterId`: Reference to User (requester)
- `status`: PENDING, APPROVED, REJECTED, COMPLETED
- `startDate`: Optional start date
- `endDate`: Optional end date
- `message`: Requester's message
- `responseMessage`: Owner's response

## 🛠️ Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm run start

# Database migrations
npx prisma migrate dev          # Create migration
npx prisma migrate deploy       # Apply migrations
npx prisma db push             # Push schema directly

# Database tools
npx prisma studio              # Open Prisma Studio GUI
npm run seed                    # Run database seeding

# From root directory
npm run db:migrate              # Create migration
npm run db:push                 # Push schema
npm run db:studio               # Open Prisma Studio
npm run db:seed                 # Seed database
npm run db:reset                # Reset and reseed database
```

## 📋 Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8080

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/raphartage_club

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880              # 5MB
MAX_FILES_PER_ITEM=10

# Admin
ADMIN_EMAIL=admin@example.com

# CORS
CORS_ORIGIN=http://localhost:8080
```

## 🔒 Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Cross-origin resource sharing with whitelist
- **Rate Limiting**: 100 requests per 15 minutes globally, 5 per 15 minutes for auth
- **Password Hashing**: bcrypt with configurable rounds
- **JWT Validation**: Secure token verification
- **httpOnly Cookies**: Prevents XSS attacks
- **Input Validation**: Zod schema validation

## 📁 File Upload

Images are uploaded to `backend/uploads/items/{itemId}/` directory. Each file is saved with a timestamp prefix to ensure uniqueness.

Supported image formats:
- JPEG
- PNG
- GIF
- WebP

## 🐛 Error Handling

All errors return consistent JSON responses with:
- `error`: Error name/type
- `code`: Error code for client-side handling
- `message`: Human-readable message
- `fields`: Validation error fields (if applicable)

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## 📝 Sample Request Examples

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### Create Item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Drill Machine",
    "description": "A powerful electric drill",
    "category": "TOOLS"
  }'
```

### Upload Images
```bash
curl -X POST http://localhost:3000/api/items/{itemId}/images \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -b cookies.txt
```

## 🔗 Integration with Frontend

The frontend connects to the backend via `VITE_API_URL` environment variable. Default is `http://localhost:3000`.

Frontend requests automatically include JWT tokens in httpOnly cookies set by the backend.

## 🧪 Testing

Use Postman, Insomnia, or curl to test the API endpoints. Ensure you:

1. Register and get approval from admin first
2. Login to get JWT token
3. Use the cookie in subsequent requests
4. Test rate limiting with multiple requests

## 📚 Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📄 License

MIT License

## 👤 Author

Raphael (raphael@example.com)

---

**Happy Sharing! 🎉**
