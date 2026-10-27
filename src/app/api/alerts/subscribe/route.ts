import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email, product_id, current_price } = await request.json();

    if (!email || !product_id || !current_price) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Insert alert subscription into Supabase using admin client (bypasses RLS safely)
    const { error } = await supabaseAdmin
      .from("alert_subscribers")
      .upsert(
        { 
          email, 
          product_id, 
          target_price: current_price - 100, // Alert if it drops even 1 rupee below current
          is_active: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'email,product_id' }
      );

    if (error) {
      console.error("[Alerts API]", error);
      return NextResponse.json({ message: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("[Alerts API]", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
