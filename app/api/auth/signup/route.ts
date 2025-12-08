import { NextRequest, NextResponse } from "next/server";

const PLATFORM_API_URL =
  process.env.PLATFORM_API_URL || "http://localhost:8000/api";

// POST /api/auth/signup - Proxy signup request to platform API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${PLATFORM_API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Error in signup proxy:", err);
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 }
    );
  }
}
