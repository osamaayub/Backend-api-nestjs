# NestJS Crash Course — JavaScript Mastery

A hands-on REST API from the JavaScript Mastery NestJS crash course. It uses [NestJS](https://nestjs.com/), TypeScript, and Express to demonstrate modules, controllers, DTOs, CRUD-style routes, automated tests, and optional application observability with NestJS Observe.

> This repository contains a NestJS backend, not a Next.js frontend.

## Features

- User endpoints for listing, searching, retrieving, and creating users
- Updating users with a partial request body
- Filtering users by name with a query parameter
- DTO-based request handling for user creation
- Middleware extension point for future API-key authentication
- TypeScript and strict project configuration
- Unit and end-to-end tests powered by [Vitest](https://vitest.dev/)
- Optional distributed tracing, metrics, logs, and error telemetry through [NestJS Observe](https://observe.nestjs.com/)

## Requirements

- Node.js 20 or later
- npm 10 or later

Check your installed versions:

```bash
node --version
npm --version
```

## Getting started

Clone the repository, move into the project directory, and install its dependencies:

```bash
git clone <repository-url>
cd jsm-nestjs
npm install
```

Start the API in development mode:

```bash
npm run start:dev
```

The server listens on port `3000` by default. Set the `PORT` environment variable to use another port:

```bash
PORT=3000 npm run start:dev
```

On Windows PowerShell, use:

```powershell
$env:PORT = 3000
npm run start:dev
```

## API endpoints

The API uses the `/user` resource path.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/user` | Return all users |
| `GET` | `/user?name=john` | Return users whose names contain `john` |
| `GET` | `/user/search?name=john` | Search users by name |
| `GET` | `/user/:id` | Return a user by numeric ID |
| `POST` | `/user` | Create a user |
| `PUT` | `/user/:id` | Update an existing user |

### Example requests

Get all users:

```bash
curl http://localhost:3000/user
```

Search for a user:

```bash
curl "http://localhost:3000/user/search?name=john"
```

Get a user by ID:

```bash
curl http://localhost:3000/user/1
```

Create a user:

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Johnson"}'
```

The current implementation stores users in memory. Data is reset whenever the application restarts, and no database is required for local development.

## API-key middleware

The project includes an `ApiKeyMiddleware` at `src/middleware/api-key.middleware.ts`. It is currently a placeholder that forwards every request to the next middleware:

```ts
use(req, res, next) {
  next();
}
```

At the moment, requests do not need an API key. The middleware is also not registered in `UserModule` or `AppModule`, so it does not run automatically.

When API-key protection is added, use a request header such as `x-api-key` and register the middleware for the routes that need protection. Store the expected key in an environment variable rather than hard-coding it or committing it to the repository.

Example request format for the future protected API:

```bash
curl http://localhost:3000/user \
  -H "x-api-key: <your-api-key>"
```

## Project structure

```text
src/
├── middleware/
│   └── api-key.middleware.ts   # API-key middleware placeholder
├── dto/
│   ├── create-user.dto.ts     # Payload for creating a user
│   └── update-user.dto.ts     # Partial user update DTO
├── user/
│   ├── user.controller.ts     # User HTTP routes
│   ├── user.module.ts         # User feature module
│   ├── user.service.ts        # User service
│   └── *.spec.ts              # User unit tests
├── app.controller.ts          # Root application route
├── app.module.ts              # Application module and Observe setup
├── app.service.ts             # Root application service
└── main.ts                    # Application bootstrap
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run start` | Start the application |
| `npm run start:dev` | Start in watch mode for development |
| `npm run start:debug` | Start in watch and debug mode |
| `npm run build` | Compile the application to `dist/` |
| `npm run start:prod` | Run the compiled application |
| `npm run lint` | Run Oxlint with TypeScript type information |
| `npm run format` | Format source and test files with Prettier |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests and generate coverage information |

Run the main validation commands before submitting changes:

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

## Observability

The application includes the NestJS Observe integration in `src/app.module.ts`. It is configured with placeholder credentials by default:

```ts
ObserveModule.forRoot({
  appKey: 'YOUR_APP_KEY',
  appSecret: 'YOUR_APP_SECRET',
  serviceId: 'jsm-nestjs',
})
```

For production telemetry, create an application at [observe.nestjs.com](https://observe.nestjs.com/) and replace the placeholder values using a secure configuration strategy. Do not commit real keys to the repository.

## Production build

Build and run the compiled application with:

```bash
npm run build
npm run start:prod
```

Set `PORT` in the production environment when the host provides a specific listening port:

```bash
PORT=8080 npm run start:prod
```

Before deploying, replace the in-memory user store with a persistent database and add production configuration, validation, authentication, and error handling appropriate for the application.

## Resources

- [NestJS documentation](https://docs.nestjs.com/)
- [NestJS controllers](https://docs.nestjs.com/controllers)
- [NestJS modules](https://docs.nestjs.com/modules)
- [NestJS testing](https://docs.nestjs.com/fundamentals/testing)
- [Vitest documentation](https://vitest.dev/)
- [NestJS deployment guide](https://docs.nestjs.com/deployment)

## License

This project is currently marked as `UNLICENSED` in `package.json` and is not published under an open-source license.
