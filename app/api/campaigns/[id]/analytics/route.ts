import { NextRequest, NextResponse } from "next/server";

const PLATFORM_API_URL =
  process.env.PLATFORM_API_URL || "http://localhost:8000/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/campaigns/:id/analytics - Get campaign analytics
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${PLATFORM_API_URL}/campaigns/${id}/analytics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in get campaign analytics proxy:", err);
    return NextResponse.json(
      { error: "Failed to get campaign analytics" },
      { status: 500 }
    );
  }
}
