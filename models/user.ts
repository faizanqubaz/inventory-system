
import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
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
      select: true,
    },
    role: {
      type: String,
      enum: ["admin", "accountant", "employee"],
      default: "employee",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", UserSchema);

export default User;
