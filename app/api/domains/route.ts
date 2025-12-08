import { NextRequest, NextResponse } from "next/server";
import { resend, transformDomain } from "@/lib/resend";

// GET /api/domains - List all domains
export async function GET() {
  try {
    const { data, error } = await resend.domains.list();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Transform domains to frontend format
    const domains = ((data?.data || []) as any[]).map(transformDomain);

    return NextResponse.json({ domains });
  } catch (err) {
    console.error("Error listing domains:", err);
    return NextResponse.json(
      { error: "Failed to list domains" },
      { status: 500 }
    );
  }
}

// POST /api/domains - Create a new domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Domain name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.domains.create({ name });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Failed to create domain" },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const domain = transformDomain(data as any);

    return NextResponse.json({ domain }, { status: 201 });
  } catch (err) {
    console.error("Error creating domain:", err);
    return NextResponse.json(
      { error: "Failed to create domain" },
      { status: 500 }
    );
  }
}
