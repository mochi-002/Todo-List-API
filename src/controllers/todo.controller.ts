import expressAsyncHandler from "express-async-handler";
import type { Response } from "express";

import {
  validateCreateToDo,
  validateUpdateToDo,
} from "../validators/todo.validate.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { sendError, sendSuccess } from "../utils/response.util.js";
import { ToDo } from "../models/todo.model.js";
import { SortOrder } from "mongoose";

const allowedSortFields = ["createdAt", "title"];
type queryParams = {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
  order?: string;
};

export const getAll = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    // req parametars for filtering and sorting
    const {
      page: pageQuery = "1",
      limit: limitQuery = "10",
      search,
      sort: sortQuery = "createdAt",
      order: orderQuery = "desc",
    } = req.query as queryParams;

    const page = Math.max(Number.parseInt(pageQuery, 10) || 1, 1);
    const limit = Math.max(Number.parseInt(limitQuery, 10) || 10, 1);
    const sort = allowedSortFields.includes(sortQuery)
      ? sortQuery
      : "createdAt";
    const order: SortOrder = orderQuery.toLowerCase() === "asc" ? 1 : -1;
    const filter = {
      owner: req.user?._id,
      ...(search
        ? {
            title: { $regex: search, $options: "i" },
            description: { $regex: search, $options: "i" },
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [todos, total] = await Promise.all([
      ToDo.find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit),

      ToDo.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    sendSuccess(res, {
      message: "Todos retrieved successfully",
      data: {
        todos,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      statusCode: 200,
    });
  },
);

export const create = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { error } = validateCreateToDo(req.body);
    if (error) {
      sendError(res, {
        message: error.details[0]?.message ?? "Validation Failed",
        statusCode: 400,
      });
      return;
    }

    const { title, description } = req.body;
    const todo = new ToDo({
      title,
      description,
      owner: req.user?._id,
    });
    await todo.save();

    sendSuccess(res, {
      message: `ToDo ${title} created successfully`,
      data: { todo },
      statusCode: 201,
    });
  },
);

export const update = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const todo = await ToDo.findById(req.params.id);
    if (!todo) {
      sendError(res, {
        message: `Todo not found`,
        statusCode: 404,
      });
      return;
    }

    if (todo.owner.toString() !== req.user?._id.toString()) {
      sendError(res, {
        message: `Forbidden`,
        statusCode: 403,
      });
      return;
    }

    const { error } = validateUpdateToDo(req.body);
    if (error) {
      sendError(res, {
        message: error.details[0]?.message ?? "Validation Failed",
        statusCode: 400,
      });
      return;
    }

    const { title, description } = req.body;
    todo.title = title;
    todo.description = description;

    await todo.save();

    sendSuccess(res, {
      message: "Todo updated successfully",
      data: todo,
      statusCode: 200,
    });
  },
);

export const remove = expressAsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const todo = await ToDo.findById(req.params.id);
    if (!todo) {
      sendError(res, {
        message: `Todo not found`,
        statusCode: 404,
      });
      return;
    }

    if (todo.owner.toString() !== req.user?._id.toString()) {
      sendError(res, {
        message: `Forbidden`,
        statusCode: 403,
      });
      return;
    }

    await ToDo.findByIdAndDelete(req.params.id);

    sendSuccess(res, {
      message: `Todo deleted`,
      statusCode: 204,
    });
  },
);
