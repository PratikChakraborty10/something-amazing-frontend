import { NextRequest, NextResponse } from "next/server";

const PLATFORM_API_URL =
  process.env.PLATFORM_API_URL || "http://localhost:8000/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/contact-lists/:id/export - Export list as CSV
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

    const response = await fetch(
      `${PLATFORM_API_URL}/contact-lists/${id}/export`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // Get the CSV content and headers from the backend response
    const csvContent = await response.text();
    const contentDisposition = response.headers.get("Content-Disposition");

    // Create response with CSV content
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          contentDisposition || `attachment; filename="contact-list.csv"`,
      },
    });
  } catch (err) {
    console.error("Error in export contact list proxy:", err);
    return NextResponse.json(
      { error: "Failed to export contact list" },
      { status: 500 }
    );
  }
}
