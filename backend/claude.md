# Backend - Express.js + Prisma Architecture Guide

## Overview

**FriendShare Hub Backend** is a RESTful API built with Express.js, TypeScript, Prisma ORM, and PostgreSQL. It handles authentication, item management, borrow requests, and admin operations for the FriendShare Hub platform.

**Location**: `H:\GitHub\friendshare-hub\backend`
**Port**: 3000
**Runtime**: Node.js 18+
**Framework**: Express.js 4.21
**Database**: PostgreSQL 15
**ORM**: Prisma 5.22

---

## 📂 Directory Structure

```
backend/src/
├── config/
│   ├── env.ts              # Environment variables with Zod validation
│   └── database.ts         # PostgreSQL connection configuration
├── controllers/            # Request handlers (business logic)
│   ├── auth.controller.ts
│   ├── items.controller.ts
│   ├── images.controller.ts
│   ├── requests.controller.ts
│   ├── generalRequests.controller.ts
│   └── admin.controller.ts
├── routes/                 # Express route definitions
│   ├── auth.routes.ts
│   ├── items.routes.ts
│   ├── images.routes.ts
│   ├── requests.routes.ts
│   ├── generalRequests.routes.ts
│   └── admin.routes.ts
├── middleware/
│   ├── auth.middleware.ts    # JWT token verification
│   ├── validate.middleware.ts # Request body validation with Zod
│   ├── error.middleware.ts    # Global error handling
│   └── upload.middleware.ts   # Multer file upload handling
├── services/
│   ├── auth.service.ts        # Auth business logic (register, login, password hashing)
│   └── storage.service.ts     # File storage operations
├── types/
│   └── express.d.ts           # Express type extensions (custom req properties)
├── utils/
│   ├── errors.ts              # Custom error classes (AppError, ValidationError)
│   └── logger.ts              # Logging utilities
├── server.ts                  # Express app initialization and startup
├── prisma/
│   ├── schema.prisma          # Database schema and models
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Database migration files
├── Dockerfile                 # Multi-stage Docker build
├── entrypoint.sh              # Docker entrypoint with migration runner
├── tsconfig.json              # TypeScript configuration
└── [root files]               # Configuration and package.json
```

---

## 🔧 Configuration Files

### tsconfig.json
- TypeScript compiler configuration
- Target: ES2020
- Module: ESNext
- Strict mode enabled
- Path alias `@/*` for imports
- Decorator support enabled

### src/config/env.ts
- Environment variable validation with Zod
- Type-safe access to config throughout app
- Variables:
  - `NODE_ENV`: development | production
  - `PORT`: Server port (default 3000)
  - `DATABASE_URL`: PostgreSQL connection string
  - `JWT_SECRET`: Secret for signing tokens
  - `JWT_EXPIRY`: Token expiration time
  - `UPLOADS_DIR`: Directory for file uploads

### Dockerfile
- Multi-stage build for optimized image
- Stage 1: Build TypeScript to JavaScript
- Stage 2: Runtime with only production dependencies
- Runs entrypoint.sh on start
- Exposes port 3000

### entrypoint.sh
- Runs database migrations on container startup
- Ensures schema is up-to-date before app starts
- Starts Express server

---

## 🗄️ Database Schema (Prisma)

### Prisma Models

#### User
```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         UserRole  @default(USER)
  status       UserStatus @default(PENDING)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  ownedItems   Item[]
  sentRequests BorrowRequest[] @relation("requester")
  receivedRequests BorrowRequest[] @relation("owner")
  generalRequests GeneralRequest[]
  generalResponses GeneralRequestResponse[]
}

enum UserRole {
  USER
  ADMIN
}

enum UserStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### Item
```prisma
model Item {
  id          String    @id @default(cuid())
  ownerId     String
  title       String
  description String
  category    ItemCategory
  status      ItemStatus @default(AVAILABLE)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  owner       User @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  images      ItemImage[]
  requests    BorrowRequest[]
  generalResponses GeneralRequestResponse[]

  @@index([ownerId])
  @@index([category])
  @@index([status])
}

enum ItemCategory {
  TOOLS
  KITCHEN
  SPORTS
  ELECTRONICS
  BOOKS
  GAMES
  CAMPING
  OTHER
}

enum ItemStatus {
  AVAILABLE
  BORROWED
  UNAVAILABLE
}
```

#### ItemImage
```prisma
model ItemImage {
  id          String    @id @default(cuid())
  itemId      String
  filePath    String
  fileName    String
  mimeType    String
  fileSize    Int
  displayOrder Int
  createdAt   DateTime  @default(now())

  item        Item @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@index([itemId])
}
```

#### BorrowRequest
```prisma
model BorrowRequest {
  id              String    @id @default(cuid())
  itemId          String
  requesterId     String
  ownerId         String
  status          RequestStatus @default(PENDING)
  startDate       DateTime
  endDate         DateTime
  message         String
  responseMessage String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  item            Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  requester       User @relation("requester", fields: [requesterId], references: [id], onDelete: Cascade)
  owner           User @relation("owner", fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([itemId])
  @@index([requesterId])
  @@index([ownerId])
  @@index([status])
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
  CANCELLED
}
```

#### GeneralRequest
```prisma
model GeneralRequest {
  id          String    @id @default(cuid())
  requesterId String
  title       String
  description String
  startDate   DateTime
  endDate     DateTime
  status      RequestStatus @default(OPEN)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  requester   User @relation(fields: [requesterId], references: [id], onDelete: Cascade)
  responses   GeneralRequestResponse[]

  @@index([requesterId])
  @@index([status])
  @@index([createdAt])
}

enum GeneralRequestStatus {
  OPEN
  FULFILLED
  CANCELLED
}
```

#### GeneralRequestResponse
```prisma
model GeneralRequestResponse {
  id                String    @id @default(cuid())
  generalRequestId  String
  responderId       String
  itemId            String
  message           String
  createdAt         DateTime  @default(now())

  generalRequest    GeneralRequest @relation(fields: [generalRequestId], references: [id], onDelete: Cascade)
  responder         User @relation(fields: [responderId], references: [id], onDelete: Cascade)
  item              Item @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@index([generalRequestId])
  @@index([responderId])
  @@index([itemId])
}
```

---

## 🔐 Authentication System

### JWT Tokens
- **Payload**: User ID, email, role
- **Storage**: httpOnly cookie (secure, not accessible via JS)
- **Expiry**: Configured in environment (typically 7 days)
- **Secret**: Configured in `JWT_SECRET` environment variable

### Password Security
- **Algorithm**: bcrypt (10 salt rounds)
- **Hashing**: Happens before storage
- **Verification**: bcrypt comparison in auth service

### Auth Middleware (`middleware/auth.middleware.ts`)
- Extracts JWT from cookies
- Verifies token signature and expiry
- Decodes user ID and attaches to `req.user`
- Returns 401 if token missing or invalid
- Returns 401 if token expired

---

## 🛣️ API Routes & Endpoints

### Authentication (`/api/auth`)

```
POST   /api/auth/register
Body:  { email, password, name }
Response: { user: { id, email, name, role, status } }

POST   /api/auth/login
Body:  { email, password }
Response: { user: { id, email, name, role, status } }

POST   /api/auth/logout
Response: { success: true }

GET    /api/auth/me
Auth:  Required (JWT)
Response: { user: { id, email, name, role, status } }
```

### Items (`/api/items`)

```
GET    /api/items
Query:  ?category=TOOLS&page=1&limit=20&search=hammer
Auth:   Optional (filters by availability)
Response: { items: [...], total, page, limit }

GET    /api/items/:id
Response: { item: { id, title, description, category, status, images, owner } }

POST   /api/items
Auth:   Required
Body:   { title, description, category }
Response: { item: { id, ... } }

PATCH  /api/items/:id
Auth:   Required (owner only)
Body:   { title?, description?, category?, status? }
Response: { item: { ... } }

DELETE /api/items/:id
Auth:   Required (owner only)
Response: { success: true }
```

### Item Images (`/api/items/:itemId/images`)

```
POST   /api/items/:itemId/images
Auth:   Required (item owner)
Body:   FormData with files[] (multipart/form-data)
Response: { images: [...] }

DELETE /api/items/:itemId/images/:imageId
Auth:   Required (item owner)
Response: { success: true }

PATCH  /api/items/:itemId/images/reorder
Auth:   Required (item owner)
Body:   { imageIds: [id1, id2, ...] }
Response: { images: [...] }
```

### Borrow Requests (`/api/requests`)

```
GET    /api/requests
Auth:   Required
Query:  ?page=1&limit=20&status=PENDING
Response: { requests: [...], total, page, limit }

GET    /api/requests/demands
Auth:   Required (incoming requests)
Query:  ?page=1&limit=20&status=PENDING
Response: { requests: [...], total, page, limit }

POST   /api/requests
Auth:   Required
Body:   { itemId, startDate, endDate, message }
Response: { request: { id, ... } }

PATCH  /api/requests/:id/approve
Auth:   Required (item owner)
Body:   { responseMessage? }
Response: { request: { status: 'APPROVED', ... } }

PATCH  /api/requests/:id/reject
Auth:   Required (item owner)
Body:   { responseMessage? }
Response: { request: { status: 'REJECTED', ... } }

PATCH  /api/requests/:id/complete
Auth:   Required (item owner)
Response: { request: { status: 'COMPLETED', ... } }
```

### General Requests (`/api/generalRequests`)

```
GET    /api/generalRequests
Query:  ?page=1&limit=20&status=OPEN
Response: { requests: [...], total, page, limit }

GET    /api/generalRequests/:id
Response: { request: { ..., responses: [...] } }

POST   /api/generalRequests
Auth:   Required
Body:   { title, description, startDate, endDate }
Response: { request: { id, ... } }

POST   /api/generalRequests/:id/respond
Auth:   Required
Body:   { itemId, message }
Response: { response: { id, ... } }
```

### Admin (`/api/admin`)

```
GET    /api/admin/users
Auth:   Required (admin only)
Query:  ?status=PENDING&page=1&limit=20
Response: { users: [...], total, page, limit }

PATCH  /api/admin/users/:id/approve
Auth:   Required (admin only)
Response: { user: { status: 'APPROVED', ... } }

PATCH  /api/admin/users/:id/reject
Auth:   Required (admin only)
Body:   { reason? }
Response: { user: { status: 'REJECTED', ... } }
```

---

## 🎯 Controllers

Each controller handles a specific domain:

### auth.controller.ts
- `register()`: Create new user with bcrypt password hashing
- `login()`: Verify credentials and issue JWT
- `logout()`: Clear JWT cookie
- `getMe()`: Return current authenticated user

### items.controller.ts
- `getItems()`: Paginated list with filters
- `getItemById()`: Single item details
- `createItem()`: Create new item (auth required)
- `updateItem()`: Update item (owner only)
- `deleteItem()`: Delete item with cascade to images/requests (owner only)

### images.controller.ts
- `uploadImages()`: Handle multipart file uploads with Multer
- `deleteImage()`: Remove image from filesystem and database
- `reorderImages()`: Update displayOrder for gallery
- `getImages()`: Get all images for an item

### requests.controller.ts
- `getRequests()`: Outgoing requests for authenticated user
- `getDemands()`: Incoming requests for item owners
- `createRequest()`: Create borrow request
- `approveRequest()`: Approve and update status (owner only)
- `rejectRequest()`: Reject request (owner only)
- `completeRequest()`: Mark as completed (owner only)

### generalRequests.controller.ts
- `getRequests()`: List general requests with filters
- `getRequestById()`: Details with responses
- `createRequest()`: Create general request
- `respondToRequest()`: Respond with specific item
- `cancelRequest()`: Cancel request

### admin.controller.ts
- `getUsers()`: List users by status (admin only)
- `approveUser()`: Change status to APPROVED
- `rejectUser()`: Change status to REJECTED

---

## 🔧 Middleware

### auth.middleware.ts
- Verifies JWT from cookies
- Validates token expiry
- Attaches user info to `req.user`
- Throws 401 if invalid

### validate.middleware.ts
- Takes Zod schema as parameter
- Validates request body against schema
- Returns 400 with field errors if invalid
- Passes validated data to controller

### error.middleware.ts
- Catches all thrown errors
- Formats error responses
- Sets appropriate HTTP status codes
- Logs errors for debugging
- Returns JSON error object to client

### upload.middleware.ts
- Configures Multer for file uploads
- Sets file size limits
- Validates MIME types
- Stores files in configured directory
- Attaches file info to `req.files`

---

## 📦 Services

### auth.service.ts
- **hashPassword()**: Bcrypt hash with cost factor 10
- **verifyPassword()**: Bcrypt compare
- **generateToken()**: Create JWT with user payload
- **verifyToken()**: Decode and validate JWT
- **register()**: Create user, hash password, return user
- **login()**: Verify credentials, generate token

### storage.service.ts
- **saveFile()**: Write file to disk
- **deleteFile()**: Remove file from filesystem
- **getFilePath()**: Generate storage path for file
- **validateFileSize()**: Check file size limits
- **validateMimeType()**: Check allowed file types

---

## 🚀 Server Setup

### server.ts
Entry point that:
1. Loads environment variables with validation
2. Creates Express app instance
3. Applies global middleware:
   - CORS with origin whitelist
   - Helmet for security headers
   - Express JSON/URL-encoded parsers
   - Rate limiting on auth endpoints
4. Mounts all route handlers:
   - `/api/auth`
   - `/api/items`
   - `/api/requests`
   - `/api/generalRequests`
   - `/api/admin`
5. Applies error handling middleware
6. Starts server on configured port
7. Initializes Prisma client

---

## 🔒 Security Features

### CORS
- Whitelist of allowed origins
- Credentials (cookies) allowed
- Specific HTTP methods allowed

### Helmet
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Remove powered-by header

### Rate Limiting
- 5 requests per 15 minutes on `/api/auth/login`
- 5 requests per 15 minutes on `/api/auth/register`
- Prevents brute force attacks

### Input Validation
- Zod schemas for all endpoints
- Strict type checking
- Validation middleware catches invalid input

### SQL Injection Protection
- Prisma parameterized queries prevent injection
- No raw SQL queries in application code

### Password Security
- Bcrypt hashing with 10 rounds
- No plaintext passwords stored
- Constant-time comparison for verification

### JWT Security
- Signed with secret key
- Expiry time enforced
- HttpOnly cookies prevent XSS access

---

## 📝 Error Handling

### Custom Error Classes

```typescript
// AppError base class
class AppError extends Error {
  constructor(message: string, public statusCode: number) {...}
}

// Specific errors
class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404)
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
  }
}

class ValidationError extends AppError {
  constructor(public errors: Record<string, string[]>) {
    super('Validation failed', 400)
  }
}

class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403)
  }
}
```

### Error Middleware
- Catches all controller errors
- Formats as JSON
- Includes field-level errors for validation failures
- Logs errors for debugging
- Returns appropriate HTTP status

---

## 🛠️ Development Workflow

### Starting Dev Server
```bash
npm run dev:backend
```

Uses `tsx` for TypeScript hot reloading on port 3000

### Building for Production
```bash
npm run build:backend
```

Compiles TypeScript to JavaScript in `dist/` directory

### Database Management

```bash
# Create migration after schema change
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio GUI
npm run db:studio
```

### Running with Docker
```bash
docker-compose up raphartage_backend
```

Automatically runs migrations via entrypoint.sh

---

## 📊 Request/Response Flow

### Typical Request Lifecycle

```
1. HTTP Request arrives at Express
2. Global middleware processes (CORS, Helmet, etc.)
3. Rate limiting checks (if applicable)
4. Route handler found
5. Auth middleware verifies JWT (if required)
6. Validation middleware validates body (if needed)
7. Controller function executes:
   - Calls Prisma ORM for database operations
   - Calls services for business logic
   - May call storage service for file operations
8. Response object created
9. Error middleware catches if error thrown
10. JSON response sent to client
```

### Example: Create Item Request

```
POST /api/items
Headers: Authorization: Bearer [JWT]
Body: { title: "Drill", description: "Power drill", category: "TOOLS" }

↓

1. Auth middleware extracts and verifies JWT
2. Validate middleware checks body against createItemSchema
3. items.controller.createItem() called
4. Prisma creates Item record with ownerId from JWT
5. Response: { item: { id, title, ..., ownerId, createdAt } }
6. HTTP 201 Created returned
```

---

## 🗂️ File Upload Handling

### Upload Process
1. Frontend sends multipart/form-data with files
2. Multer middleware receives request
3. Files validated (size, MIME type)
4. Files saved to disk in `UPLOADS_DIR`
5. File metadata saved to database
6. Response includes file URLs for frontend

### File Organization
```
uploads/
├── {itemId}/
│   ├── {imageId}-original.jpg
│   ├── {imageId}-original.jpg
│   └── {imageId}-original.jpg
```

### Deletion
- Delete from database
- Delete from filesystem
- Frontend no longer displays

---

## 📊 Database Optimization

### Indexes
- User: primary key, email (unique)
- Item: ownerId, category, status
- ItemImage: itemId
- BorrowRequest: itemId, requesterId, ownerId, status
- GeneralRequest: requesterId, status, createdAt
- GeneralRequestResponse: generalRequestId, responderId, itemId

### Query Patterns
- Pagination for list endpoints
- Filtering by status, category, date
- Sorting by date (most recent first)
- Include relations only when needed

---

## 🔄 Integration with Frontend

### CORS Configuration
- Allows requests from frontend origin
- Credentials (cookies) included in requests
- Specific headers and methods allowed

### API Response Format
```typescript
{
  data?: T,
  user?: User,
  request?: BorrowRequest,
  items?: Item[],
  total?: number,
  page?: number,
  limit?: number,
  error?: string,
  errors?: Record<string, string[]>
}
```

### Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad request (validation error)
- **401**: Unauthorized (missing/invalid JWT)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **500**: Server error

---

## 📖 Related Documentation

- **Root Project Guide**: See `../claude.md` for full project overview
- **Frontend Guide**: See `../frontend/claude.md` for client integration details
- **Prisma Documentation**: https://www.prisma.io/docs
- **Express.js Documentation**: https://expressjs.com
- **PostgreSQL Documentation**: https://www.postgresql.org/docs

