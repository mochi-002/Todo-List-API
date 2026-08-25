import express from "express";
import mongoose from "mongoose";
import { sendError } from "../utils/response.util.js";

export const notFound = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  sendError(res, {
    message: `Route not found: ${req.originalUrl}`,
    statusCode: 404,
  });
};

export const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  sendError(res, {
    message: "Something went wrong, please try again later",
    statusCode: 500,
  });
};

export const validateId = (id: string, res: express.Response): boolean => {
  if (!mongoose.isValidObjectId(id)) {
    sendError(res, {
      message: `Invalid ID`,
      statusCode: 400,
    });

    return false;
  }

  return true;
};
