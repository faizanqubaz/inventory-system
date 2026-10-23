import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/libs/database";
import PurchaseRequest from "@/models/PurchaseRequest";
import Notification from "@/models/Notification";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const status = String(body.status ?? "").toLowerCase();

    // Validate MongoDB request ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request ID",
        },
        { status: 400 }
      );
    }

    // Validate the requested status
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status must be approved or rejected",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the purchase request
    const purchaseRequest = await PurchaseRequest.findById(id);

    if (!purchaseRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Purchase request not found",
        },
        { status: 404 }
      );
    }

    const previousStatus = purchaseRequest.status;

    // Allow changing pending, approved, or rejected requests
    purchaseRequest.status = status;
    await purchaseRequest.save();

    // Mark existing notifications for this request as read
    await Notification.updateMany(
      { requestId: purchaseRequest._id },
      { $set: { isRead: true } }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Purchase request status changed from ${previousStatus} to ${status} successfully`,
        request: purchaseRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update purchase request status:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update purchase request status",
      },
      { status: 500 }
    );
  }
}