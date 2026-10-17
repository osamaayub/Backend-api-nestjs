# NestJS Backend API

A REST API built with [NestJS](https://nestjs.com/), TypeScript and Express, following the JavaScript Mastery NestJS crash course. It shows the core NestJS building blocks working together: modules, controllers, services, DTO validation, middleware, interceptors, guards and tests.

![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white)

## Features

- **User CRUD API**: list, filter, search, get by ID, create and update users
- **Request validation**: DTOs checked by `class-validator` through a global `ValidationPipe`
- **API key protection**: middleware that requires an `x-api-key` header on every route
- **Consistent responses**: a global interceptor wraps every response as `{ statusCode, data, message }`
- **Role guard**: a `RoleGuard` scaffold ready for role-based access rules
- **Observability**: optional tracing, metrics and logs via [NestJS Observe](https://observe.nestjs.com/)
- **Testing**: unit and end-to-end tests with [Vitest](https://vitest.dev/) and Supertest

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | NestJS 12, Express |
| Language | TypeScript (ES modules) |
| Validation | class-validator, class-transformer, @nestjs/mapped-types |
| Testing | Vitest, Supertest |
| Code quality | Oxlint, Prettier |

## Getting started

### Prerequisites

- Node.js 20 or later
- npm 10 or later

### Installation

```bash
git clone https://github.com/osamaayub/Backend-api-nestjs.git
cd Backend-api-nestjs
npm install
```

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `API_KEY` | Yes | Key that clients must send in the `x-api-key` header |
| `PORT` | No | Port the server listens on (default `3000`) |

Set them in your shell before starting the app.

macOS / Linux:

```bash
export API_KEY=my-secret-key
```

Windows PowerShell:

```powershell
$env:API_KEY = "my-secret-key"
```

> Keep real keys out of the repository. `.env` files are already listed in `.gitignore`.

### Run the app

```bash
npm run start:dev
```

The API is now available at `http://localhost:3000`.

## API reference

Every request must include the API key header:

```
x-api-key: <your API_KEY>
```

Requests without a valid key receive `401 Unauthorized`.

### Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Health check, returns `Hello World!` |
| `GET` | `/user` | List all users |
| `GET` | `/user?name=john` | List users whose name contains `john` |
| `GET` | `/user/search?name=john` | Search users by name |
| `GET` | `/user/:id` | Get a user by numeric ID |
| `POST` | `/user` | Create a user |
| `PUT` | `/user/:id` | Update a user (partial body allowed) |

### Request body

`POST /user` validates the body with `CreateUserDto`:

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | Required, at least 3 characters |
| `email` | string | Required, valid email address |

`PUT /user/:id` uses `UpdateUserDto`, so every field is optional but follows the same rules when sent.

### Response format

Successful responses are wrapped by `TransformInterceptor`:

```json
{
  "statusCode": 200,
  "data": { "id": 1, "name": "John Doe" },
  "message": "Success"
}
```

Errors use the standard NestJS format, for example:

```json
{
  "statusCode": 404,
  "message": "User with id 99 not found",
  "error": "Not Found"
}
```

### Examples

```bash
# List users
curl http://localhost:3000/user -H "x-api-key: my-secret-key"

# Search by name
curl "http://localhost:3000/user/search?name=john" -H "x-api-key: my-secret-key"

# Get one user
curl http://localhost:3000/user/1 -H "x-api-key: my-secret-key"

# Create a user
curl -X POST http://localhost:3000/user \
  -H "x-api-key: my-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Johnson","email":"alex@example.com"}'

# Update a user
curl -X PUT http://localhost:3000/user/1 \
  -H "x-api-key: my-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated"}'
```

> Users are stored in memory and seeded with three sample users. Data resets every time the server restarts.

## Project structure

```text
src/
├── dto/
│   ├── create-user.dto.ts         # Validation rules for creating a user
│   └── update-user.dto.ts         # Partial version for updates
├── guards/
│   └── role.guard.ts              # Role-based access guard (scaffold)
├── middleware/
│   └── api-key.middleware.ts      # Checks the x-api-key header
├── user/
│   ├── user.controller.ts         # /user routes
│   ├── user.service.ts            # User business logic and in-memory store
│   ├── user.logger.ts             # Simple logger service
│   └── user.module.ts             # User feature module
├── utils/
│   └── transform.interceptor.ts   # Wraps responses in a standard shape
├── app.module.ts                  # Root module, Observe setup, middleware registration
└── main.ts                        # Bootstrap: global pipe and interceptor
test/
└── app.e2e-spec.ts                # End-to-end tests
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start in watch mode |
| `npm run start:debug` | Start in watch and debug mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled build |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Lint with Oxlint |
| `npm run format` | Format with Prettier |

## Observability (optional)

`src/app.module.ts` registers NestJS Observe with placeholder credentials (`YOUR_APP_KEY` / `YOUR_APP_SECRET`). To collect real telemetry, create an app at [observe.nestjs.com](https://observe.nestjs.com/) and supply the keys through environment variables. Never commit real keys.

## Roadmap

- [ ] Replace the in-memory store with a database (Prisma is already installed)
- [ ] Add a `DELETE /user/:id` route (service method already exists)
- [ ] Implement real role checks in `RoleGuard`
- [ ] Load configuration from `.env` with `@nestjs/config`

## Resources

- [NestJS documentation](https://docs.nestjs.com/)
- [Validation in NestJS](https://docs.nestjs.com/techniques/validation)
- [Middleware](https://docs.nestjs.com/middleware) and [Interceptors](https://docs.nestjs.com/interceptors)
- [Vitest documentation](https://vitest.dev/)

## Author

**Osama Ayub** · [GitHub @osamaayub](https://github.com/osamaayub)
