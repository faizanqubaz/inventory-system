import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/libs/database";
import Notification from "@/models/Notification";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid notification ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const notification = await Notification.findByIdAndUpdate(
      id,
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Failed to update notification:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update notification" },
      { status: 500 }
    );
  }
}