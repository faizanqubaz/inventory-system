
import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import PurchaseRequest from "@/models/PurchaseRequest";



export async function GET() {
  try {
    await connectDB();

    // Current month's date range
    const now = new Date();

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    // Purchasing cost: approved requests for this month
    const purchasingCostResult = await PurchaseRequest.aggregate([
      {
        $match: {
          status: "approved",
          date: {
            $gte: monthStart,
            $lt: nextMonthStart,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Total quantity of items across all requests
    const totalItemsResult = await PurchaseRequest.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]);

    // Approved requests this month
    const approvedRequisitions = await PurchaseRequest.countDocuments({
      status: "approved",
      date: {
        $gte: monthStart,
        $lt: nextMonthStart,
      },
    });

    // All rejected requests
    const rejectedRequests = await PurchaseRequest.countDocuments({
      status: "rejected",
    });

    const stats = {
      purchasingCost: purchasingCostResult[0]?.total ?? 0,
      totalPurchaseItems: totalItemsResult[0]?.total ?? 0,
      approvedRequisitions,
      rejectedRequests,
    };

    return NextResponse.json(
      { success: true, stats },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard stats API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics.",
      },
      { status: 500 }
    );
  }
}
