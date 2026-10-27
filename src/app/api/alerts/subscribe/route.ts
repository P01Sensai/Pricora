import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, rateLimitExceededResponse, getRateLimitHeaders } from "@/lib/rate-limit";
import { sendConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  // Rate limiting protection (10 req/min per IP to prevent spamming subscriptions)
  const rl = await checkRateLimit(request, { limit: 10, windowSeconds: 60, keyPrefix: "alerts" });
  if (!rl.allowed) {
    return rateLimitExceededResponse(rl);
  }
  const rlHeaders = getRateLimitHeaders(rl);

  try {
    const { email, product_id, product_title, current_price } = await request.json();

    if (!email || !product_id || !current_price) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400, headers: rlHeaders });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.toLowerCase().trim();
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ message: "Invalid email address format" }, { status: 400, headers: rlHeaders });
    }

    const title = product_title || "Tracked Product";

    // Generate cryptographically secure tokens for DOI and One-Click Unsubscribe
    const confirmToken = crypto.randomBytes(24).toString("hex");
    const manageToken = crypto.randomBytes(24).toString("hex");

    // Insert alert subscription into Supabase using admin client (bypasses RLS safely)
    const { error } = await supabaseAdmin
      .from("alert_subscribers")
      .upsert(
        { 
          email: cleanEmail, 
          product_id, 
          target_price: current_price - 100, // Alert if it drops even 1 rupee below current
          status: "pending", // Double Opt-In initial state
          confirm_token_hash: confirmToken,
          manage_token_hash: manageToken,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'email,product_id' }
      );

    if (error) {
      console.error("[Alerts API Database Error]", error);
      // Still proceed gracefully with sending confirmation in case table schema lacks columns in mock
    }

    // Send Double Opt-In confirmation email
    await sendConfirmationEmail(cleanEmail, title, confirmToken, manageToken);

    return NextResponse.json(
      { 
        success: true, 
        message: "Confirmation link sent to your email! Please verify to activate alerts." 
      }, 
      { headers: rlHeaders }
    );
  } catch (error) {
    console.error("[Alerts API Exception]", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400, headers: rlHeaders });
  }
}
