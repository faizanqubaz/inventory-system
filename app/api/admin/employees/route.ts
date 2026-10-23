
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/libs/database";
import User from "@/models/user";
import Employee from "@/models/employees";
import { resend } from "@/libs/resend";
import { employeeActivationEmail } from "@/libs/email/employee-activation-email";


export async function GET() {
  try {
    // IMPORTANT:
    // Add your existing admin authentication/authorization check here.

    await connectDB();

    const employees = await Employee.find()
      .select(
        "name email phone department position status user createdAt updatedAt activatedAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        message: "Employees fetched successfully",
        count: employees.length,
        employees: employees.map((employee) => ({
          id: employee._id.toString(),
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          position: employee.position,
          status: employee.status,
          user: employee.user?.toString(),
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt,
          activatedAt: employee.activatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch employees error:", error);

    return NextResponse.json(
      { message: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  let createdUserId: string | undefined;
  let createdEmployeeId: string | undefined;

  try {
    // IMPORTANT:
    // Keep your existing admin authentication/authorization
    // check here before allowing employee creation.

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
        : "";
    const position =
      typeof body.position === "string"
        ? body.position.trim()
        : "";

    if (!name || !email || !phone || !department || !position) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
      return NextResponse.json(
        { message: "An employee with this email already exists" },
        { status: 409 }
      );
    }

    // Create an unpredictable initial password that nobody knows.
    // The employee chooses their actual password during activation.
    const randomInitialPassword = randomBytes(48).toString("hex");
    const initialPasswordHash = await bcrypt.hash(
      randomInitialPassword,
      12
    );

    const user = await User.create({
      email,
      password: initialPasswordHash,
      role: "employee",
    });

    createdUserId = user._id.toString();

    // The original token is emailed, never stored in the database.
    const activationToken = randomBytes(32).toString("hex");

    const activationTokenHash = createHash("sha256")
      .update(activationToken)
      .digest("hex");
console.log('activationtoken',activationTokenHash)
    const activationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const employee = await Employee.create({
      name,
      email,
      phone,
      department,
      position,
      status: "inactive",
      user: user._id,
      activationTokenHash,
      activationTokenExpiresAt,
    });

    createdEmployeeId = employee._id.toString();

    const appUrl = process.env.APP_URL?.replace(/\/+$/, "");

    if (!appUrl) {
      throw new Error("APP_URL is not configured");
    }

    const activationUrl =
      `${appUrl}/activate-employee?token=${activationToken}`;

    const from = process.env.RESEND_FROM_EMAIL;

    if (!from) {
      throw new Error("RESEND_FROM_EMAIL is not configured");
    }

    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject: "Activate your employee account",
      html: employeeActivationEmail(name, activationUrl),
    });

    if (error || !data?.id) {
      console.error(
        "Resend email error:",
        error?.message ?? "No email ID returned"
      );

      throw new Error("Failed to send activation email");
    }

    return NextResponse.json(
      {
        message:
          "Employee created successfully. An activation email has been sent.",
        employee: {
          id: employee._id.toString(),
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          position: employee.position,
          status: employee.status,
          createdAt: employee.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create employee error:", error);

    // Remove the new records if the operation failed.
    // This prevents an inactive account without a delivered activation
    // email from being left behind.
    try {
      if (createdEmployeeId) {
        await Employee.findByIdAndDelete(createdEmployeeId);
      }

      if (createdUserId) {
        await User.findByIdAndDelete(createdUserId);
      }
    } catch (cleanupError) {
      console.error("Employee cleanup failed:", cleanupError);
    }

    return NextResponse.json(
      { message: "Failed to create employee or send activation email" },
      { status: 500 }
    );
  }
}
