import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch specific employee name by address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const employeeName = await prisma.employeeName.findUnique({
      where: { address: address.toLowerCase() },
      select: {
        address: true,
        name: true,
      },
    });

    if (!employeeName) {
      return NextResponse.json(
        { error: "Employee name not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employeeName);
  } catch (error) {
    console.error("Error fetching employee name:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee name" },
      { status: 500 }
    );
  }
}
