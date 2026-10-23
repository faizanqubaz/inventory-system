
import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";

import mongoose from "mongoose";
import { connectDB } from "@/libs/database";
import Employee from "@/models/employees";
import User from "@/models/user";
import { employeeActivationEmail } from "@/libs/email/employee-activation-email";
import { resend } from "@/libs/resend";



const ACTIVATION_HOURS = 24;

export async function GET() {
  try {
    await connectDB();

    // Fetch profiles and their linked users.
    const profiles = await Employee.find()
      .select(
        "name email phone department position status user createdAt updatedAt activatedAt"
      )
      .populate("user", "email role")
      .sort({ createdAt: -1 })
      .lean();

    // Only return profiles linked to accountant accounts.
    const accountants = profiles
      .filter(
        (profile: any) =>
          profile.user &&
          profile.user.role === "accountant"
      )
      .map((profile: any) => ({
        _id: profile._id.toString(),
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? "",
        department: profile.department ?? "Finance",
        position: profile.position ?? "Accountant",
        status: profile.status,
        role: profile.user.role,
        activatedAt: profile.activatedAt ?? null,
        createdAt: profile.createdAt,
      }));

    return NextResponse.json({ accountants });
  } catch (error) {
    console.error("GET accountants error:", error);

    return NextResponse.json(
      { message: "Failed to fetch accountants." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let createdUserId: mongoose.Types.ObjectId | null = null;
  let createdProfileId: mongoose.Types.ObjectId | null = null;

  try {
    await connectDB();

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";
    const department =
      typeof body.department === "string"
        ? body.department.trim()
        : "Finance";

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required." },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // A single email must not be used by another account.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Generate a random initial password.
    // The accountant will set their own password through activation.
    const temporaryPassword = randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: "accountant",
    });

    createdUserId = user._id;

    // Generate a secure, single-use activation token.
    const activationToken = randomBytes(32).toString("hex");
    const activationTokenHash = createHash("sha256")
      .update(activationToken)
      .digest("hex");

    const activationTokenExpiresAt = new Date(
      Date.now() + ACTIVATION_HOURS * 60 * 60 * 1000
    );

    const accountantProfile = await Employee.create({
      name,
      email,
      phone,
      department: department || "Finance",
      position: "Accountant",
      status: "inactive",
      user: user._id,
      activationTokenHash,
      activationTokenExpiresAt,
    });

    createdProfileId = accountantProfile._id;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
    }

    const activationUrl =
      `${appUrl.replace(/\/$/, "")}/activate-employee` +
      `?token=${activationToken}`;

    const emailContent = employeeActivationEmail(
      name,
      activationUrl
    );

    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error("RESEND_FROM_EMAIL is not configured.");
    }

    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Activate your AccountFlow accountant account",
      html: emailContent,
    });

    if (emailResult.error) {
      throw new Error("The activation email could not be sent.");
    }

    return NextResponse.json(
      {
        message:
          "Accountant created successfully. An activation email has been sent.",
        accountant: {
          _id: accountantProfile._id.toString(),
          name: accountantProfile.name,
          email: accountantProfile.email,
          phone: accountantProfile.phone,
          department: accountantProfile.department,
          position: accountantProfile.position,
          status: accountantProfile.status,
          role: "accountant",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST accountant error:", error);

    // Roll back partial creation if setup or email delivery fails.
    if (createdProfileId) {
      await Employee.findByIdAndDelete(createdProfileId).catch(
        (cleanupError: unknown) =>
          console.error("Profile cleanup error:", cleanupError)
      );
    }

    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId).catch(
        (cleanupError: unknown) =>
          console.error("User cleanup error:", cleanupError)
      );
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create accountant.",
      },
      { status: 500 }
    );
  }
}
