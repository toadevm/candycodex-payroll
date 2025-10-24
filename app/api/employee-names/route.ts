import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all employee names
export async function GET() {
  try {
    const employeeNames = await prisma.employeeName.findMany({
      select: {
        address: true,
        name: true,
      },
    });

    // Convert to object map for easier lookup
    const namesMap = employeeNames.reduce((acc, emp) => {
      acc[emp.address.toLowerCase()] = emp.name;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(namesMap);
  } catch (error) {
    console.error("Error fetching employee names:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee names" },
      { status: 500 }
    );
  }
}

// POST - Add or update employee name
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, name } = body;

    if (!address || !name) {
      return NextResponse.json(
        { error: "Address and name are required" },
        { status: 400 }
      );
    }

    // Validate address format (basic check)
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length === 0 || name.trim().length > 100) {
      return NextResponse.json(
        { error: "Name must be between 1 and 100 characters" },
        { status: 400 }
      );
    }

    // Upsert employee name (insert or update if exists)
    const employeeName = await prisma.employeeName.upsert({
      where: { address: address.toLowerCase() },
      update: { name: name.trim() },
      create: {
        address: address.toLowerCase(),
        name: name.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      data: employeeName,
    });
  } catch (error) {
    console.error("Error saving employee name:", error);
    return NextResponse.json(
      { error: "Failed to save employee name" },
      { status: 500 }
    );
  }
}

// DELETE - Remove employee name
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    await prisma.employeeName.delete({
      where: { address: address.toLowerCase() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting employee name:", error);
    return NextResponse.json(
      { error: "Failed to delete employee name" },
      { status: 500 }
    );
  }
}
