# NestJS Backend API & Core Concepts Guide

A robust REST API built with [NestJS](https://nestjs.com/), TypeScript, and Express. This project serves as both a functional backend API and a practical, hands-on reference demonstrating the core architectural building blocks and concepts of NestJS.

![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white)

---

## Table of Contents

- [NestJS Core Concepts Explained](#nestjs-core-concepts-explained)
  - [1. Request-Response Lifecycle](#1-request-response-lifecycle)
  - [2. Modules (`@Module`)](#2-modules-module)
  - [3. Controllers & Routing (`@Controller`)](#3-controllers--routing-controller)
  - [4. Providers & Dependency Injection (`@Injectable`)](#4-providers--dependency-injection-injectable)
  - [5. Pipes & Data Validation (`PipeTransform`)](#5-pipes--data-validation-pipetransform)
  - [6. Middleware (`NestMiddleware`)](#6-middleware-nestmiddleware)
  - [7. Guards & Authorization (`CanActivate`)](#7-guards--authorization-canactivate)
  - [8. Interceptors & RxJS (`NestInterceptor`)](#8-interceptors--rxjs-nestinterceptor)
  - [9. Exception Handling (`HttpException`)](#9-exception-handling-httpexception)
  - [10. Authentication & Observability](#10-authentication--observability)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Reference](#api-reference)
  - [Authentication & Headers](#authentication--headers)
  - [Endpoints Summary](#endpoints-summary)
  - [DTO Validation Rules](#dto-validation-rules)
  - [Response Formats](#response-formats)
  - [cURL Examples](#curl-examples)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Resources](#resources)

---

## NestJS Core Concepts Explained

This project demonstrates how core NestJS concepts work together to build a modular, maintainable, and scalable enterprise-grade backend.

### 1. Request-Response Lifecycle

When an incoming HTTP request hits this NestJS application, it flows through the following pipeline:

```text
Incoming Request
       │
       ▼
┌────────────────────────┐
│  Global / Route        │  ApiKeyMiddleware
│  Middleware            │  (Validates x-api-key header)
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  Guards                │  RoleGuard
│  (CanActivate)         │  (Checks role header e.g. admin for DELETE)
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  Interceptors (Pre)    │  TransformInterceptor
│  (Before handler)      │  (Initializes execution context)
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  Pipes                 │  ValidationPipe & ParseIntPipe
│  (Transform & Validate)│  (Validates DTOs & parses path parameters)
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  Controller Handler    │  UserController & UserService
│  & Service Execution   │  (Executes business logic)
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  Interceptors (Post)   │  TransformInterceptor (RxJS map)
│  (Response Mapping)    │  (Wraps result in { statusCode, data, message })
└──────────┬─────────────┘
           │
           ▼
Outgoing HTTP Response
```

---

### 2. Modules (`@Module`)

Modules are the foundational building blocks in NestJS. Every NestJS application has at least one **Root Module** (`AppModule`), which is the starting point used to build the application graph. Feature-specific code is organized into **Feature Modules** (`UserModule`).

- **Root Module (`src/app.module.ts`)**: Imports feature modules and configures application-wide middleware and monitoring plugins (`ObserveModule`).
- **Feature Module (`src/user/user.module.ts`)**: Encapsulates all user-related controllers and providers.
- **Module Metadata Properties**:
  - `controllers`: Array of controllers defined in this module that should be instantiated.
  - `providers`: Array of services and helpers instantiated by the NestJS injector and shared within the module.
  - `imports`: Other modules required by this module.
  - `exports`: Subset of providers to make available to other modules importing this module.

```typescript
// src/user/user.module.ts
@Module({
  controllers: [UserController],
  providers: [UserService, LoggerService],
})
export class UserModule {}
```

---

### 3. Controllers & Routing (`@Controller`)

Controllers handle incoming HTTP requests and return responses to the client. Routing mechanisms control which controller receives which requests.

- **Route Prefix**: `@Controller('user')` groups all endpoints under `/user`.
- **HTTP Method Decorators**: `@Get()`, `@Post()`, `@Put(':id')`, `@Delete(':id')`.
- **Route Parameters & Query Extraction**:
  - `@Param('id', ParseIntPipe)` extracts and transforms path parameters (`/user/:id`).
  - `@Query('name')` extracts URL query parameters (`/user?name=john`).
  - `@Body()` extracts the parsed JSON request body and binds it to a typed DTO.

```typescript
// src/user/user.controller.ts
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
```

---

### 4. Providers & Dependency Injection (`@Injectable`)

Providers are plain JavaScript classes marked with `@Injectable()`. NestJS uses an **Inversion of Control (IoC)** container to manage dependencies automatically through constructor injection.

- **`UserService` (`src/user/user.service.ts`)**: Contains all business logic and in-memory state manipulation.
- **`LoggerService` (`src/user/user.logger.ts`)**: Utility service injected into `UserService` to log operations.
- **`AppService` (`src/app.service.ts`)**: Root application service.

```typescript
// src/user/user.service.ts
@Injectable()
export class UserService {
  constructor(private readonly loggerService: LoggerService) {
    this.loggerService.log('UserService initialized');
  }

  // CRUD methods...
}
```

---

### 5. Pipes & Data Validation (`PipeTransform`)

Pipes have two primary use cases:
1. **Transformation**: Transform input data to the desired type (e.g., string to integer).
2. **Validation**: Evaluate input data against defined rules and throw an exception if invalid.

#### Built-in Transformation Pipes
- **`ParseIntPipe`**: Automatically converts string route parameters into integers and throws a `400 Bad Request` if the string cannot be parsed:
  ```typescript
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number)
  ```

#### Global Validation Pipe & DTOs
In `src/main.ts`, `app.useGlobalPipes(new ValidationPipe())` is bound globally. DTOs define the shape and validation constraints of incoming payloads using `class-validator` and `@nestjs/mapped-types`:

- **`CreateUserDto` (`src/dto/create-user.dto.ts`)**:
  ```typescript
  export class CreateUserDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsEmail()
    email: string;
  }
  ```
- **`UpdateUserDto` (`src/dto/update-user.dto.ts`)**:
  Uses `PartialType(CreateUserDto)` to make all fields optional while preserving validation rules for any provided field.

---

### 6. Middleware (`NestMiddleware`)

Middleware functions have access to the `Request` and `Response` objects and the `next()` middleware function in the application's request-response cycle.

- **`ApiKeyMiddleware` (`src/middleware/api-key.middleware.ts`)**:
  Inspects incoming HTTP headers for `x-api-key`. If the header is missing or does not match `process.env.API_KEY`, it throws an `UnauthorizedException`.
- **Applying Middleware (`src/app.module.ts`)**:
  Modules implementing `NestModule` register middleware using `MiddlewareConsumer`:

```typescript
// src/app.module.ts
export class AppModule implements NestModule {
  async configure(consumer: MiddlewareConsumer): Promise<void> {
    consumer
      .apply((await import('./middleware/api-key.middleware.js')).ApiKeyMiddleware)
      .forRoutes('*');
  }
}
```

---

### 7. Guards & Authorization (`CanActivate`)

Guards determine whether a given request will be handled by the route handler or not, depending on certain conditions (permissions, roles, ACLs) present at runtime.

- **`RoleGuard` (`src/guards/role.guard.ts`)**:
  Implements `CanActivate` to check if `role: admin` is present in the request headers. If not, it throws an `UnauthorizedException`.
- **Usage with `@UseGuards()`**:
  Applied directly to protected routes, such as `DELETE /user/:id`:

```typescript
@Delete(':id')
@UseGuards(RoleGuard)
deleteUser(@Param('id', ParseIntPipe) id: number) {
  return this.userService.deleteUser(id);
}
```

---

### 8. Interceptors & RxJS (`NestInterceptor`)

Interceptors allow you to:
- Bind extra logic before / after method execution.
- Transform the result returned from a function.
- Transform the exception thrown from a function.
- Extend basic function behavior.

- **`TransformInterceptor` (`src/utils/transform.interceptor.ts`)**:
  Intercepts controller responses using RxJS operators (`map`) and wraps all outgoing successful payloads in a uniform structure:
  ```json
  {
    "statusCode": 200,
    "data": { ... },
    "message": "Success"
  }
  ```
- Registered globally in `src/main.ts`:
  ```typescript
  app.useGlobalInterceptors(new TransformInterceptor());
  ```

---

### 9. Exception Handling (`HttpException`)

NestJS comes with a built-in exceptions layer responsible for processing all unhandled exceptions across an application.

- **Built-in Exceptions used in this project**:
  - `NotFoundException`: Thrown when a requested resource does not exist (e.g., `User with id 99 not found`). Returns HTTP 404.
  - `UnauthorizedException`: Thrown when an API key or role header is invalid or missing. Returns HTTP 401.
  - `BadRequestException`: Automatically thrown by `ValidationPipe` or `ParseIntPipe` when input fails validation. Returns HTTP 400.

---

### 10. Authentication & Observability

- **Better Auth Integration (`src/lib/auth.ts`, `src/lib/auth-client.ts`)**:
  Configured with `@better-auth` and `pg` connection pool for PostgreSQL-backed authentication.
- **NestJS Observe (`src/app.module.ts`, `src/main.ts`)**:
  Integrated via `@nestjs/observe` (`createObserveModule()`) and `ObserveInstrument` for automated distributed tracing, metrics, and error telemetry.

---

## Tech Stack

| Area | Technologies / Libraries |
| :--- | :--- |
| **Framework** | [NestJS 12](https://nestjs.com/), Express |
| **Language** | TypeScript (Node16 / ES Modules) |
| **Validation** | `class-validator`, `class-transformer`, `@nestjs/mapped-types` |
| **Auth & DB** | Better Auth (`better-auth`), PostgreSQL client (`pg`) |
| **Observability** | `@nestjs/observe` |
| **Testing** | [Vitest](https://vitest.dev/), Supertest |
| **Code Quality** | Oxlint, Prettier |

---

## Getting Started

### Prerequisites

- **Node.js**: v20.x or later
- **npm**: v10.x or later

### Installation

```bash
# Clone the repository
git clone https://github.com/osamaayub/Backend-api-nestjs.git
cd Backend-api-nestjs/jsm-nestjs

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in `jsm-nestjs` or export environment variables in your terminal:

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `API_KEY` | **Yes** | — | Secret API key required by `ApiKeyMiddleware` in `x-api-key` header |
| `PORT` | No | `3000` | Port on which the HTTP server will listen |

**macOS / Linux:**
```bash
export API_KEY="my-secret-key"
export PORT=3000
```

**Windows PowerShell:**
```powershell
$env:API_KEY = "my-secret-key"
$env:PORT = "3000"
```

### Running the Application

```bash
# Start in watch (development) mode
npm run start:dev

# Start in production mode
npm run build
npm run start:prod
```

The server will be available at `http://localhost:3000`.

---

## API Reference

### Authentication & Headers

Every request to the API is inspected by `ApiKeyMiddleware` and requires the `x-api-key` header:

```http
x-api-key: my-secret-key
```

Protected operations (such as `DELETE /user/:id`) additionally require the `role` header:

```http
role: admin
```

---

### Endpoints Summary

| Method | Endpoint | Guard / Middleware | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | `ApiKeyMiddleware` | Root health check, returns `Hello World!` |
| `GET` | `/user` | `ApiKeyMiddleware` | Retrieve all users (supports optional `?name=` query filter) |
| `GET` | `/user/search?name=:name` | `ApiKeyMiddleware` | Search users by name query parameter |
| `GET` | `/user/:id` | `ApiKeyMiddleware`, `ParseIntPipe` | Retrieve a single user by numeric ID |
| `POST` | `/user` | `ApiKeyMiddleware`, `ValidationPipe` | Create a new user with validation |
| `PUT` | `/user/:id` | `ApiKeyMiddleware`, `ValidationPipe` | Update an existing user (partial fields allowed) |
| `DELETE`| `/user/:id` | `ApiKeyMiddleware`, `RoleGuard`, `ParseIntPipe` | Delete a user by numeric ID (**Admin only**) |

---

### DTO Validation Rules

#### `POST /user` (`CreateUserDto`)
| Field | Type | Validation Rules | Description |
| :--- | :---: | :--- | :--- |
| `name` | `string` | `@IsString()`, `@MinLength(3)` | User's full name (min 3 chars) |
| `email` | `string` | `@IsEmail()` | Valid email address |

#### `PUT /user/:id` (`UpdateUserDto`)
Extends `PartialType(CreateUserDto)`. All fields are optional, but any provided field must satisfy the validation rules:
| Field | Type | Validation Rules | Description |
| :--- | :---: | :--- | :--- |
| `name` | `string` (optional) | `@IsString()`, `@MinLength(3)` | Updated full name |
| `email` | `string` (optional) | `@IsEmail()` | Updated email address |

---

### Response Formats

#### Standard Success Response (via `TransformInterceptor`)
```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "John Doe"
  },
  "message": "Success"
}
```

#### Standard Error Response (NestJS Exception Layer)
```json
{
  "statusCode": 404,
  "message": "User with id 99 not found",
  "error": "Not Found"
}
```

---

### cURL Examples

```bash
# 1. Health Check
curl http://localhost:3000/ \
  -H "x-api-key: my-secret-key"

# 2. Get All Users
curl http://localhost:3000/user \
  -H "x-api-key: my-secret-key"

# 3. Filter Users by Name
curl "http://localhost:3000/user?name=john" \
  -H "x-api-key: my-secret-key"

# 4. Search Users
curl "http://localhost:3000/user/search?name=jane" \
  -H "x-api-key: my-secret-key"

# 5. Get User by ID
curl http://localhost:3000/user/1 \
  -H "x-api-key: my-secret-key"

# 6. Create User
curl -X POST http://localhost:3000/user \
  -H "x-api-key: my-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Wonderland", "email": "alice@example.com"}'

# 7. Update User
curl -X PUT http://localhost:3000/user/1 \
  -H "x-api-key: my-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "Johnathan Doe"}'

# 8. Delete User (Requires Admin Role)
curl -X DELETE http://localhost:3000/user/1 \
  -H "x-api-key: my-secret-key" \
  -H "role: admin"
```

---

## Project Structure

```text
jsm-nestjs/
├── src/
│   ├── dto/
│   │   ├── create-user.dto.ts       # Validation rules for user creation
│   │   └── update-user.dto.ts       # Partial validation rules for updates
│   ├── guards/
│   │   └── role.guard.ts            # CanActivate guard checking 'role' header
│   ├── lib/
│   │   ├── auth.ts                  # Better Auth server configuration with PostgreSQL
│   │   └── auth-client.ts           # Better Auth client configuration
│   ├── middleware/
│   │   └── api-key.middleware.ts    # NestMiddleware validating 'x-api-key' header
│   ├── user/
│   │   ├── user.controller.ts       # REST controller handling /user routes
│   │   ├── user.service.ts          # Business logic & in-memory user repository
│   │   ├── user.logger.ts           # Logger provider service
│   │   └── user.module.ts           # User feature module
│   ├── utils/
│   │   └── transform.interceptor.ts # Interceptor wrapping responses in standard shape
│   ├── app.controller.ts            # Root controller (health check)
│   ├── app.service.ts               # Root service
│   ├── app.module.ts                # Application root module & middleware registration
│   └── main.ts                      # App bootstrap, global pipes & global interceptors
├── test/                            # Integration / E2E test suites
├── vitest.config.ts                 # Vitest test runner configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Project dependencies and npm scripts
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run start:dev` | Starts the application with hot-reloading (watch mode) |
| `npm run start:debug` | Starts the application with debugging enabled |
| `npm run build` | Compiles TypeScript into production build in `dist/` |
| `npm run start:prod` | Runs the compiled production build from `dist/` |
| `npm test` | Runs unit tests using Vitest |
| `npm run test:watch` | Runs unit tests in interactive watch mode |
| `npm run test:cov` | Generates test coverage report |
| `npm run test:e2e` | Runs end-to-end (E2E) tests |
| `npm run lint` | Runs Oxlint linter for static code analysis |
| `npm run format` | Formats code with Prettier |

---

## Resources

- [Official NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Architecture & Lifecycle](https://docs.nestjs.com/faq/request-lifecycle)
- [Validation Techniques in NestJS](https://docs.nestjs.com/techniques/validation)
- [NestJS Guards & Authorization](https://docs.nestjs.com/guards)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)
- [NestJS Middleware](https://docs.nestjs.com/middleware)
- [Better Auth Documentation](https://better-auth.com/)

---

## Author

**Osama Ayub** · [GitHub @osamaayub](https://github.com/osamaayub)
