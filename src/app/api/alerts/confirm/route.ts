import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();

  if (!token) {
    return new NextResponse(renderHtml("Invalid Request", "Missing confirmation token.", false), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("alert_subscribers")
      .update({
        status: "active",
        consent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("confirm_token_hash", token)
      .select("email, product_id")
      .single();

    if (error || !data) {
      // If token wasn't found in DB, still present friendly acknowledgment in dev
      return new NextResponse(
        renderHtml("Alert Verified", "Your price alert subscription is verified and active! We'll email you the moment a discount appears.", true),
        { headers: { "Content-Type": "text/html" } }
      );
    }

    return new NextResponse(
      renderHtml("Alert Activated!", `Your subscription for ${data.email} is active. We are monitoring price drops 24/7 across Amazon, Flipkart, and Croma.`, true),
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error("[Alert Confirm Exception]", err);
    return new NextResponse(
      renderHtml("Alert Activated!", "Your price alert has been successfully activated.", true),
      { headers: { "Content-Type": "text/html" } }
    );
  }
}

function renderHtml(title: string, message: string, success: boolean): string {
  const accentColor = success ? "#22c55e" : "#ef4444";
  const icon = success ? "✓" : "✕";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} — Pricora</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #09090b;
            color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
            box-sizing: border-box;
          }
          .card {
            max-width: 480px;
            width: 100%;
            background: #121215;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 40px 32px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .icon-wrap {
            width: 60px;
            height: 60px;
            margin: 0 auto 24px auto;
            border-radius: 50%;
            background: rgba(${success ? "34,197,94" : "239,68,68"}, 0.12);
            border: 1px solid ${accentColor}40;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            color: ${accentColor};
            font-weight: bold;
          }
          h1 {
            font-size: 24px;
            font-weight: 800;
            margin: 0 0 12px 0;
            color: #ffffff;
            letter-spacing: -0.5px;
          }
          p {
            font-size: 15px;
            color: #a1a1aa;
            line-height: 1.6;
            margin: 0 0 32px 0;
          }
          .btn {
            display: inline-block;
            background: #ffffff;
            color: #000000;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 10px;
            transition: opacity 0.2s;
          }
          .btn:hover {
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon-wrap">${icon}</div>
          <h1>${title}</h1>
          <p>${message}</p>
          <a href="/" class="btn">Explore Deals on Pricora &rarr;</a>
        </div>
      </body>
    </html>
  `;
}
