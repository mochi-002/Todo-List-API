# Todo List API

A small Express + TypeScript API for managing a personal to-do list,
backed by MongoDB, with JWT-based user authentication, Joi request
validation, and pagination/filtering support.

A solution to the [roadmap.sh Todo List API project](https://roadmap.sh/projects/todo-list-api).

## Requirements

- [Node.js](https://nodejs.org/) 18 or later
- npm
- A MongoDB instance (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas))

## Installation

```bash
git clone https://github.com/mochi-002/Todo-List-API.git
cd todo-list-api
npm install
npm run build
```

This compiles the TypeScript source into `dist/`. Run the server with:

```bash
node dist/server.js
```

> Tip: during development, `npm run dev` recompiles and restarts
> automatically on file changes.

## Environment variables

Create a `.env` file in the project root:

```txt
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

| Variable     | Description                                | Default |
| ------------ | ------------------------------------------ | ------- |
| `PORT`       | Port the server listens on                 | —       |
| `MONGO_URI`  | Connection string for the MongoDB instance | —       |
| `JWT_SECRET` | Secret used to sign and verify auth tokens | —       |

## Authentication

Passwords are hashed before being stored. Registration and login both
respond with a JWT that must be sent on every `/todos` request via the
`Authorization` header:

```txt
Authorization: Bearer <token>
```

Requests without a valid token receive `401 Unauthorized`. Attempts to
update or delete a to-do item that belongs to a different user receive
`403 Forbidden`.

## Usage

### Register a user

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@doe.com",
    "password": "password"
  }'
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
}
```

### Log in

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@doe.com",
    "password": "password"
  }'
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
}
```

### Create a to-do item

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Buy groceries",
    "description": "Buy milk, eggs, and bread"
  }'
```

### Get to-do items (paginated)

```bash
curl "http://localhost:3000/todos?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

```json
{
  "data": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Buy milk, eggs, and bread"
    },
    {
      "id": 2,
      "title": "Pay bills",
      "description": "Pay electricity and water bills"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 2
}
```

### Update a to-do item

```bash
curl -X PUT http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Buy groceries",
    "description": "Buy milk, eggs, bread, and cheese"
  }'
```

### Delete a to-do item

```bash
curl -X DELETE http://localhost:3000/todos/1 \
  -H "Authorization: Bearer <token>"
```

Responds with `204 No Content` on success.

Example to-do item shape:

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Buy milk, eggs, and bread"
}
```

### Error responses

| Status | Meaning                                                   |
| ------ | --------------------------------------------------------- |
| `400`  | Validation failed, or the todo ID is not a valid ObjectId |
| `401`  | Missing or invalid authentication token                   |
| `403`  | Authenticated user does not own the to-do item            |
| `404`  | Todo not found, or the requested route does not exist     |
| `500`  | Unexpected internal error                                 |

## Validation rules

| Field         | Rules                                     |
| ------------- | ----------------------------------------- |
| `name`        | Required, string (registration only)      |
| `email`       | Required, valid email, must be unique     |
| `password`    | Required, string, minimum length enforced |
| `title`       | Required, string                          |
| `description` | Optional, string                          |

## Project structure

```txt
server.ts                        Entry point — sets up Express, middleware, and routes
config/db.ts                     MongoDB connection setup via Mongoose
controllers/auth.controller.ts   Request handlers for register/login
controllers/todo.controller.ts   Request handlers for CRUD operations on todos
models/user.model.ts             Mongoose schema and Joi validation for users
models/todo.model.ts             Mongoose schema and Joi validation for todos
routes/auth.router.ts            Route definitions for /register and /login
routes/todo.router.ts            Route definitions for /todos
middleware/auth.middleware.ts    JWT verification and request authorization
middleware/logger.middleware.ts  Color-coded console logger
middleware/errors.middlewares.ts 404 handler, error handler, and ObjectId validation
```

## Testing

```bash
curl "http://localhost:3000/todos" -H "Authorization: Bearer <token>"
curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d '{}'   # -> 400, validation error
curl "http://localhost:3000/todos" -H "Authorization: Bearer invalid_token"                                               # -> 401, unauthorized
curl "http://localhost:3000/todos/000000000000000000000000" -H "Authorization: Bearer <token>"                            # -> 404, todo not found
```

## Roadmap

> **Note:** the bonus requirements below are not yet implemented and
> will be added in a future update.

- [ ] Filtering and sorting for the to-do list
- [ ] Unit tests
- [ ] Rate limiting and throttling
- [ ] Refresh token mechanism
