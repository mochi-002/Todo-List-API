import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches token expiry
    });

    const userObj = user.toObject();
    const { password: _password, ...other } = userObj;
    sendSuccess(res, {
      message: `User ${userObj.name} logged in successfully`,
      data: { user: other, token },
      statusCode: 201,
    });
  },
);

/**
 * @description Refresh Access Token
 * @route /auth/refresh
 * @method POST
 * @access public (relies on httpOnly cookie)
 */
export const refresh = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const incomingToken = req.cookies?.refreshToken;
    if (!incomingToken) {
      sendError(res, { message: "No refresh token provided", statusCode: 401 });
      return;
    }

    let payload: { _id: string };
    try {
      payload = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET!) as {
        _id: string;
      };
    } catch {
      sendError(res, {
        message: "Invalid or expired refresh token",
        statusCode: 403,
      });
      return;
    }

    const user = await User.findById(payload._id);
    if (!user) {
      sendError(res, { message: "User no longer exists", statusCode: 404 });
      return;
    }

    const newAccessToken = user.generateAccessToken();
    sendSuccess(res, {
      message: "Token refreshed",
      data: { token: newAccessToken },
      statusCode: 200,
    });
  },
);
