import mongoose from "mongoose";
import { logger } from "../middlewares/logger.middleware.js";

const connectToDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not defined");
  }

  await mongoose.connect(mongoURI);
  logger.separator();
  logger.separator();
  logger.success("MongoDB connected");
};

export { connectToDB };
