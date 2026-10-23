
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

import PurchaseRequest from "@/models/PurchaseRequest";
import Notification from "@/models/Notification";
import { connectDB } from "@/libs/database";
import mongoose from 'mongoose'



const uploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "purchase-receipts"
);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function successResponse(
  message: string,
  data: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(
    { success: true, message, data },
    { status }
  );
}

async function saveReceipt(file: File | null) {
  if (!file || file.size === 0) {
    return { receiptUrl: "", filePath: null as string | null };
  }

  const extension = ALLOWED_TYPES[file.type];

  if (!extension) {
    throw new Error("Only JPG, PNG, and WEBP images are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Receipt image must be 5 MB or smaller.");
  }

  await fs.mkdir(uploadDirectory, { recursive: true });

  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const filePath = path.join(uploadDirectory, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, buffer);

  return {
    receiptUrl: `/uploads/purchase-receipts/${filename}`,
    filePath,
  };
}

export async function POST(request: NextRequest) {
  console.log('running...')
  let uploadedFilePath: string | null = null;
  let savedRequestId: string | null = null;

  try {
    const formData = await request.formData();
    console.log('formdata in server', formData)
    const itemName = String(formData.get("itemName") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const quantityValue = formData.get("quantity");
    const amountValue = formData.get("amount");
    const description = String(
      formData.get("description") ?? ""
    ).trim();
    const dateValue = String(formData.get("date") ?? "");
    const employeeId = String(
      formData.get("employeeId") ?? ""
    ).trim();
    const quantity = Number(quantityValue);
    const amount = Number(amountValue);
    const date = new Date(dateValue);

    const receiptValue = formData.get("receipt");
    const receiptFile =
      receiptValue instanceof File && receiptValue.size > 0
        ? receiptValue
        : null;

    // // Validate required fields.
    if (
      !itemName ||
      !category ||
      quantityValue === null ||
      String(quantityValue).trim() === "" ||
      amountValue === null ||
      String(amountValue).trim() === "" ||
      !dateValue ||
      !employeeId
    ) {
      return errorResponse(
        "Please fill in all required fields.",
        400
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      Number.isNaN(date.getTime())
    ) {
      return errorResponse(
        "Please provide a valid quantity, amount, and date.",
        400
      );
    }

    // // Connect to MongoDB.
    await connectDB();

    // // Save the receipt image.
    const uploaded = await saveReceipt(receiptFile);
    uploadedFilePath = uploaded.filePath;

    // // Save the purchase request as pending.
    const purchaseRequest = await PurchaseRequest.create({
      itemName,
      category,
      quantity,
      amount,
      description,
      date,
      employeeId,
      receipt: uploaded.receiptUrl,
      status: "pending",
    });

    savedRequestId = purchaseRequest._id.toString();
    console.log('purchaserequest', purchaseRequest)
    // // Create an unread admin notification.
    await Notification.create({
      title: "New Purchase Request",
      message: `A new request for "${itemName}" needs approval.`,
      type: "purchase_request",
      requestId: purchaseRequest._id,
      isRead: false,
    });

    return successResponse(
      "Your request has been sent to the admin successfully.",
      { request: purchaseRequest },
      201
    );
  } catch (error: unknown) {
    console.error("Purchase request API error:", error);

    // Remove the request if notification creation failed.
    if (savedRequestId) {
      try {
        await PurchaseRequest.findByIdAndDelete(savedRequestId);
      } catch (rollbackError) {
        console.error("Request rollback failed:", rollbackError);
      }
    }

    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (cleanupError) {
        console.error("Receipt cleanup failed:", cleanupError);
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit your request. Please try again.";

    const isValidationError =
      message.includes("Only JPG, PNG, and WEBP") ||
      message.includes("5 MB or smaller");

    return errorResponse(
      isValidationError
        ? message
        : "Unable to submit your request. Please try again.",
      isValidationError ? 400 : 500
    );
  }
}



// GET REQUEST

export async function GET(request: NextRequest) {
  try {
    const employeeId = request.nextUrl.searchParams.get("employeeId");

    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid employee ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const requests = await PurchaseRequest.find({ employeeId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      requests: requests.map((request) => ({
        ...request,
        id: request._id.toString(),
        _id: request._id.toString(),
        employeeId: request.employeeId.toString(),
        date: request.date.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Fetch employee purchase requests error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch your purchase requests.",
      },
      { status: 500 }
    );
  }
}