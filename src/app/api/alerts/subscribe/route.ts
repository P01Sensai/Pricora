import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, rateLimitExceededResponse, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limiting protection (10 req/min per IP to prevent spamming subscriptions)
  const rl = await checkRateLimit(request, { limit: 10, windowSeconds: 60, keyPrefix: "alerts" });
  if (!rl.allowed) {
    return rateLimitExceededResponse(rl);
  }
  const rlHeaders = getRateLimitHeaders(rl);

  try {
    const { email, product_id, current_price } = await request.json();

    if (!email || !product_id || !current_price) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400, headers: rlHeaders });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email address format" }, { status: 400, headers: rlHeaders });
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
      return NextResponse.json({ message: "Database error" }, { status: 500, headers: rlHeaders });
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully!" }, { headers: rlHeaders });
  } catch (error) {
    console.error("[Alerts API]", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400, headers: rlHeaders });
  }
}
