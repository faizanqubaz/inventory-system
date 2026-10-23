
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/libs/database";
import Employee from "@/models/employees";
import User from "@/models/user";

export async function POST(request: Request) {
  try {
    // 1. Read and validate request
    let body: { token?: unknown; password?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const token =
      typeof body.token === "string" ? body.token.trim() : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { message: "Invalid or expired activation link" },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { message: "Password must be between 8 and 128 characters" },
        { status: 400 }
      );
    }

    // 2. Connect to MongoDB
    await connectDB();

    // 3. Hash the token. Only the hash is stored in MongoDB.
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    // 4. Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Check the token before starting a transaction.
    // This diagnostic does not log the token or password.
    const debugEmployee = await Employee.findOne({
      activationTokenHash: tokenHash,
    })
      .select("+activationTokenHash +activationTokenExpiresAt")
      .lean();

    console.log("Employee activation diagnostic:", {
      employeeFound: Boolean(debugEmployee),
      status: debugEmployee?.status ?? null,
      expiresAt: debugEmployee?.activationTokenExpiresAt ?? null,
      expired: debugEmployee?.activationTokenExpiresAt
        ? new Date(debugEmployee.activationTokenExpiresAt) <= new Date()
        : null,
    });

    if (!debugEmployee) {
      return NextResponse.json(
        {
          message:
            "This activation link is invalid, expired, or already used. Please request a new activation link.",
        },
        { status: 400 }
      );
    }

    if (debugEmployee.status !== "inactive") {
      return NextResponse.json(
        {
          message:
            "This employee account is already activated or is no longer eligible for activation.",
        },
        { status: 400 }
      );
    }

    if (
      !debugEmployee.activationTokenExpiresAt ||
      new Date(debugEmployee.activationTokenExpiresAt) <= new Date()
    ) {
      return NextResponse.json(
        {
          message:
            "This activation link has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // 6. Activate the account and update the password atomically.
    // MongoDB transactions require a replica set or sharded cluster.
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const now = new Date();

        const employee = await Employee.findOne({
          _id: debugEmployee._id,
          activationTokenHash: tokenHash,
          activationTokenExpiresAt: { $gt: now },
          status: "inactive",
        })
          .select("+activationTokenHash +activationTokenExpiresAt")
          .session(session);

        if (!employee) {
          throw new Error("INVALID_ACTIVATION_LINK");
        }

      const user = await User.findOne({
  _id: employee.user,
  email: employee.email,
  role: { $in: ["employee", "accountant"] },
}).session(session);

if (!user) {
  throw new Error("EMPLOYEE_ACCOUNT_NOT_FOUND");
}

        if (!user) {
          throw new Error("EMPLOYEE_ACCOUNT_NOT_FOUND");
        }

        user.password = passwordHash;
        await user.save({ session });

        const result = await Employee.updateOne(
          {
            _id: employee._id,
            status: "inactive",
            activationTokenHash: tokenHash,
            activationTokenExpiresAt: { $gt: now },
          },
          {
            $set: {
              status: "active",
              activatedAt: now,
            },
            $unset: {
              activationTokenHash: 1,
              activationTokenExpiresAt: 1,
            },
          },
          { session }
        );

        if (result.modifiedCount !== 1) {
          throw new Error("INVALID_ACTIVATION_LINK");
        }
      });

      return NextResponse.json(
        {
          message: "Your account is activated. You can now log in.",
        },
        { status: 200 }
      );
    } finally {
      await session.endSession();
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_ACTIVATION_LINK"
    ) {
      return NextResponse.json(
        {
          message:
            "This activation link is invalid, expired, or already used.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "EMPLOYEE_ACCOUNT_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          message: "The employee login account could not be found.",
        },
        { status: 404 }
      );
    }

    console.error("Employee activation error:", error);

    return NextResponse.json(
      {
        message:
          "Unable to activate your account. Please try again.",
      },
      { status: 500 }
    );
  }
}
