import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";

import { IUser, User } from "../models/user.model.js";
import { sendError, sendSuccess } from "../utils/response.util.js";
import {
  validateLoginData,
  validateReqisterData,
} from "../validators/auth.validate.js";

/**
 * @description Register New User
 * @route /auth/register
 * @method POST
 * @access public
 */
export const reqister = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { error } = validateReqisterData(req.body);
    if (error) {
      sendError(res, {
        message: error.details[0]?.message ?? "Validation Failed",
        statusCode: 400,
      });
      return;
    }

    const { name, email, password }: IUser = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      sendError(res, {
        message: `User already registered`,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    const token = user.generateToken();

    const userObj = user.toObject();
    const { password: _password, ...other } = userObj;
    sendSuccess(res, {
      message: `User ${name} registered successfully`,
      data: { user: other, token },
      statusCode: 201,
    });
  },
);

/**
 * @description User Login
 * @route /auth/login
 * @method POST
 * @access public
 */
export const login = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { error } = validateLoginData(req.body);

    if (error) {
      sendError(res, {
        message: error.details?.[0]?.message ?? "Validation Failed",
        statusCode: 400,
      });
      return;
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      sendError(res, {
        message: `User not found, Invalid email or password`,
      });
      return;
    }

    const passwordMatches: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!passwordMatches) {
      sendError(res, {
        message: `User not found, Invalid email or password`,
      });
      return;
    }

    const token = user.generateToken();
    const userObj = user.toObject();
    const { password: _password, ...other } = userObj;

    sendSuccess(res, {
      message: `User logged in successfully`,
      data: { user: other, token },
      statusCode: 200,
    });
  },
);
