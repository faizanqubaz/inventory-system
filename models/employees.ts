
import { Schema, models, model } from "mongoose";

const EmployeeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Only the hashed activation token is stored.
    activationTokenHash: {
      type: String,
      select: false,
    },
    activationTokenExpiresAt: {
      type: Date,
      select: false,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

EmployeeSchema.index(
  { activationTokenHash: 1 },
  { sparse: true }
);

const Employee =
  models.Employee || model("Employee", EmployeeSchema);

export default Employee;
