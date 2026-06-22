# NestJS Auth API

A NestJS authentication API built with TypeScript, PostgreSQL, Prisma, JWT, bcrypt, and Swagger.

## Features

- User registration
- Login
- JWT access tokens
- Refresh token rotation
- Password hashing with bcrypt
- Role-based access control: USER and ADMIN
- Protected routes
- Password reset flow
- Swagger API documentation

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- JWT
- bcrypt
- Swagger

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Set environment variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestjs_auth_api?schema=public"

JWT_ACCESS_SECRET="change-this-access-secret"
JWT_REFRESH_SECRET="change-this-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### Run database migration

```bash
pnpm prisma migrate dev
```

### Generate Prisma client

```bash
pnpm prisma generate
```

### Start the server

```bash
pnpm run start:dev
```

## API Documentation

Swagger docs are available at:

```txt
http://localhost:3000/docs
```

## Auth Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive tokens |
| POST | `/auth/refresh` | Refresh access and refresh tokens |
| POST | `/auth/logout` | Logout current user |
| GET | `/auth/me` | Get authenticated user |
| GET | `/auth/admin` | Admin-only route |
| POST | `/auth/forgot-password` | Generate password reset token |
| POST | `/auth/reset-password` | Reset password |

## Scripts

```bash
pnpm run start:dev
pnpm run build
pnpm run test
pnpm prisma studio
```
