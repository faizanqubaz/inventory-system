
import { connectDB } from "@/libs/database";
import User from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { message: "Email and password must be not be number" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        { message: "Incorrect email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const role = String(user.role).toLowerCase();

    const dashboards: Record<string, string> = {
      admin: "/admin/dashboard",
      accountant: "/admin/accountant/dashboard",
      employee: "/admin/employees/dashboard",
    };

    const redirectTo = dashboards[role];

    if (!redirectTo) {
      return NextResponse.json(
        { message: "Your account has an invalid role" },
        { status: 403 }
      );
    }

    const secret = process.env.JWT_SECRET || 'abcdef';

    if (!secret) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }
    console.log('user', user)
    const userInfo = {
      id: user._id.toString(),
      email: user.email,
      role,
    };
    console.log('userinfo', userInfo)
    const token = jwt.sign(userInfo, secret, {
      expiresIn: "1d",
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: userInfo,
      redirectTo,
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
