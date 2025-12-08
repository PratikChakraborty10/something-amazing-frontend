import { NextRequest, NextResponse } from "next/server";
import { resend, transformDomain } from "@/lib/resend";

// GET /api/domains/[id] - Get domain details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await resend.domains.get(id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    const domain = transformDomain(data as any);

    return NextResponse.json({ domain });
  } catch (err) {
    console.error("Error getting domain:", err);
    return NextResponse.json(
      { error: "Failed to get domain" },
      { status: 500 }
    );
  }
}

// DELETE /api/domains/[id] - Delete domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await resend.domains.remove(id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting domain:", err);
    return NextResponse.json(
      { error: "Failed to delete domain" },
      { status: 500 }
    );
  }
}
