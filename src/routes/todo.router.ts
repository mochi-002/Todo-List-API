import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  create as createTodo,
  getAll as getAllTodos,
  remove as removeTodo,
  update as updateTodo,
} from "../controllers/todo.controller.js";

export const todoRouter: Router = Router();

todoRouter.use(verifyToken);

todoRouter.route("/").get(getAllTodos).post(createTodo);
todoRouter.route("/:id").put(updateTodo).delete(removeTodo);
