// imports
import express from "express";
import "dotenv/config";
import { requestsLogger } from "./middlewares/logger.middleware.js";
import { authRouter } from "./routes/auth.router.js";
import { todoRouter } from "./routes/todo.router.js";
import {
  errorHandler,
  notFound,
} from "./middlewares/errorHandlers.middleware.js";

// APP
const app: express.Application = express();

// Middlewares
app.use(express.json());
app.use(requestsLogger);

// Routes
app.use("/", authRouter);
app.use("/todos", todoRouter);

// Errors
app.use(notFound);
app.use(errorHandler);

export default app;
