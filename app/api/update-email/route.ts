import { NextResponse, NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  try {
    // User check
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { email?: string } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Get email
    const { email } = body;
    if (!email || !email.includes("@"))
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });

    // Update auth email
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email },
    );

    if (authError)
      return NextResponse.json({ error: authError.message }, { status: 400 });

    return NextResponse.json(
      { message: "Email updated successfully" },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
