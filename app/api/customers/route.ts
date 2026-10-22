import { connectDB } from "@/libs/database";
import { NextRequest, NextResponse } from "next/server";




export async function GET(request: NextRequest) {
  try {
   await connectDB();
    

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error("GET  ME ERROR:", error);

    
  }
}