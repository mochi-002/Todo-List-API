import { Router } from "express";
import { login, reqister } from "../controllers/auth.controller.js";
import { authLimiter } from "../utils/types.js";

export const authRouter: Router = Router();

authRouter.route("/register").post(reqister);
authRouter.route("/login").post(authLimiter, login);
