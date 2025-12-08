import { NextRequest, NextResponse } from "next/server";
import { resend, transformDomain } from "@/lib/resend";

// POST /api/domains/[id]/verify - Verify domain DNS records
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await resend.domains.verify(id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Failed to verify domain" },
        { status: 500 }
      );
    }

    const domain = transformDomain(data as any);

    return NextResponse.json({ domain });
  } catch (err) {
    console.error("Error verifying domain:", err);
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    );
  }
}
