import { NextRequest, NextResponse } from "next/server";

const PLATFORM_API_URL =
  process.env.PLATFORM_API_URL || "http://localhost:8000/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/contact-lists/:id - Get single contact list
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

    // Forward query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${PLATFORM_API_URL}/contact-lists/${id}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
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
    console.error("Error in get contact list proxy:", err);
    return NextResponse.json(
      { error: "Failed to get contact list" },
      { status: 500 }
    );
  }
}

// PATCH /api/contact-lists/:id - Update contact list
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${PLATFORM_API_URL}/contact-lists/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in update contact list proxy:", err);
    return NextResponse.json(
      { error: "Failed to update contact list" },
      { status: 500 }
    );
  }
}

// DELETE /api/contact-lists/:id - Delete contact list
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${PLATFORM_API_URL}/contact-lists/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ message: "Contact list deleted successfully" });
  } catch (err) {
    console.error("Error in delete contact list proxy:", err);
    return NextResponse.json(
      { error: "Failed to delete contact list" },
      { status: 500 }
    );
  }
}
