import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import "dotenv/config";

export interface IUser {
  name: string;
  email: string;
  password: string;
}

interface IUserMethods {
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

type UserDocument = mongoose.HydratedDocument<IUser, IUserMethods>;

const UserSchema = new mongoose.Schema<
  IUser,
  mongoose.Model<IUser, {}, IUserMethods>
>({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 20,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.methods.generateAccessToken = function (): string {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" },
  );
  return `${token}`;
};

UserSchema.methods.generateRefreshToken = function (): string {
  const token = jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
    },
  );
  return `${token}`;
};

export const User = mongoose.model<
  IUser,
  mongoose.Model<IUser, {}, IUserMethods>
>("User", UserSchema);
