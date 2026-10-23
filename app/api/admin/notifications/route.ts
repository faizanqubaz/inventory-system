import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import Notification from "@/models/Notification";
import "@/models/PurchaseRequest";

export async function GET() {
  try {
    await connectDB();

    const notifications = await Notification.find({
      isRead: false,
      type: "purchase_request",
    })
      .populate("requestId")
      .sort({ createdAt: -1 })
      .lean();

    // Only return notifications linked to pending purchase requests.
    const pendingNotifications = notifications.filter((notification: any) => {
      return (
        notification.requestId &&
        notification.requestId.status?.toLowerCase() === "pending"
      );
    });

    return NextResponse.json({
      success: true,
      notifications: pendingNotifications,
      count: pendingNotifications.length,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}