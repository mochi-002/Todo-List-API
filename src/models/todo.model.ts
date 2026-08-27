import mongoose from "mongoose";

export interface ITodo {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
}

const TodoSchema = new mongoose.Schema<ITodo>(
  {
    title: {
      type: String,
      minLength: 3,
      maxLength: 100,
      require: true,
    },
    description: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const ToDo = mongoose.model<ITodo>("ToDo", TodoSchema);
