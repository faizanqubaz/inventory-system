
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/libs/database";
import PurchaseRequest from "@/models/PurchaseRequest";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid purchase request ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const paymentStatus = body.paymentStatus;

    if (!["paid", "unpaid"].includes(paymentStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment status must be paid or unpaid.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const purchaseRequest = await PurchaseRequest.findOneAndUpdate(
      { _id: id, status: "approved" },
      { $set: { paymentStatus } },
      { new: true, runValidators: true }
    );

    if (!purchaseRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Approved purchase request not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payment marked ${paymentStatus}.`,
      request: {
        id: purchaseRequest._id.toString(),
        paymentStatus: purchaseRequest.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Update payment status:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update payment status.",
      },
      { status: 500 }
    );
  }
}
