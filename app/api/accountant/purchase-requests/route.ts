
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/libs/database";
import PurchaseRequest from "@/models/PurchaseRequest";


export async function GET() {
  try {
    await connectDB();

    const requests = await PurchaseRequest.find({
      status: "approved",
    })
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      requests: requests.map((request: any) => {
        const employee =
          request.employeeId &&
          typeof request.employeeId === "object"
            ? request.employeeId
            : null;

        return {
          id: request._id.toString(),
          _id: request._id.toString(),
          employeeId: employee?._id?.toString() ?? "",
          employee: employee?.name ?? employee?.email ?? "Unknown employee",
          department: employee?.department ?? "N/A",
          item: request.itemName,
          category: request.category,
          quantity: request.quantity,
          amount: request.amount,
          date: request.date
            ? new Date(request.date).toISOString()
            : "",
          description: request.description ?? "",
          receipt: request.receipt ?? "",
          status: request.status,
          paymentStatus: request.paymentStatus ?? "unpaid",
        };
      }),
    });
  } catch (error) {
    console.error("Fetch accountant purchase requests:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch approved purchase requests.",
      },
      { status: 500 }
    );
  }
}
