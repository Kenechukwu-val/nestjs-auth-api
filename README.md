# NestJS Auth API

Built a secure production-style authentication API using NestJS, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, refresh token rotation, role-based access control, email verification, password reset email delivery, rate limiting, and Swagger documentation.

## Project Purpose

This project demonstrates a production-style backend authentication system for modern web applications. It includes user registration, login, protected routes, role-based authorization, refresh token handling, email delivery, request per minutes and password reset functionality.

## Features

* User registration
* User login
* JWT access tokens
* Refresh token rotation
* Password hashing with bcrypt
* Role-based access control: `USER` and `ADMIN`
* Protected routes
* Authenticated user profile route
* Admin-only route
* Password reset with email delivery
* Rate limiting for authentic routes
* Swagger API documentation
* PostgreSQL database integration with Prisma

## Tech Stack

* NestJS
* TypeScript
* PostgreSQL
* Prisma
* JWT
* bcrypt
* Swagger
* Nodemailer
* Throttler
* pnpm

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd nestjs-auth-api
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestjs_auth_api?schema=public"

JWT_ACCESS_SECRET="change-this-access-secret"
JWT_REFRESH_SECRET="change-this-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

APP_URL="http://localhost:3000"

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM="Auth API <no-reply@example.com>"
```

### 4. Run database migration

```bash
pnpm prisma migrate dev
```

### 5. Generate Prisma client

```bash
pnpm prisma generate
```

### 6. Start the development server

```bash
pnpm run start:dev
```

## API Documentation

Swagger documentation is available at:

```txt
http://localhost:3000/docs
```

## Auth Endpoints

| Method | Endpoint                | Description                                  |
| ------ | ----------------------- | -------------------------------------------- |
| POST   | `/auth/register`        | Register a new user                          |
| POST   | `/auth/login`           | Login and receive access and refresh tokens  |
| POST   | `/auth/refresh`         | Rotate refresh token and generate new tokens |
| POST   | `/auth/logout`          | Logout current user                          |
| GET    | `/auth/me`              | Get authenticated user profile               |
| GET    | `/auth/admin`           | Admin-only protected route                   |
| POST   | `/auth/forgot-password` | Send password reset email                |
| POST   | `/auth/reset-password`  | Reset user password                          |
| POST   | `/auth/verify-email`                               | Verify user email |
| POST   | `/auth/resend-verification-email`          | Resend verification email |

## Security Features

* Passwords are hashed using bcrypt before being stored
* Protected routes require valid JWT access tokens
* Refresh token rotation helps improve session security
* Role-based access control restricts admin-only routes
* Sensitive configuration values are stored in environment variables

## Scripts

```bash
pnpm run start:dev
pnpm run build
pnpm run test
pnpm prisma studio
```

## Testing

This project includes automated tests for authentication flows and core backend behavior.

### Run tests

```bash
pnpm run test

```bash
pnpm run test:e2e

## Future Improvements

* Docker setup
* CI/CD deployment pipeline
