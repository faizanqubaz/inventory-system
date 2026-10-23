
import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import PurchaseRequest from "@/models/PurchaseRequest";



export async function GET() {
  try {
    await connectDB();

    const requests = await PurchaseRequest.find({})
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        requests,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch purchase requests error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch purchase requests.",
      },
      { status: 500 }
    );
  }
}
