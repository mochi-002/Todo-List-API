import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import "dotenv/config";

export interface IUser {
  name: string;
  email: string;
  password: string;
}

interface IUserMethods {
  generateToken(): string;
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

UserSchema.methods.generateToken = function (): string {
  const token = jwt.sign(
    {
      _id: this.id,
      email: this.email,
      name: this.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "12h" },
  );
  return `${token}`;
};

export const User = mongoose.model<
  IUser,
  mongoose.Model<IUser, {}, IUserMethods>
>("User", UserSchema);
