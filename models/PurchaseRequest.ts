
import mongoose, { Schema } from "mongoose";

const PurchaseRequestSchema = new Schema(
  {
    itemName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
    receipt: {
      type: String,
      default: "",
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.PurchaseRequest ||
  mongoose.model("PurchaseRequest", PurchaseRequestSchema);
