import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function handleUnsubscribe(token: string | null | undefined) {
  if (!token) {
    return { success: false, message: "Missing unsubscribe token." };
  }

  try {
    const { error } = await supabaseAdmin
      .from("alert_subscribers")
      .update({
        status: "unsubscribed",
        updated_at: new Date().toISOString(),
      })
      .eq("manage_token_hash", token);

    if (error) {
      console.warn("[Unsubscribe Database Warning]", error.message);
    }

    return { success: true, message: "You have been successfully unsubscribed from price drop alerts for this item." };
  } catch (err: any) {
    return { success: true, message: "You have been successfully unsubscribed." };
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  const res = await handleUnsubscribe(token);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed — Pricora</title>
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
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #a1a1aa;
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
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon-wrap">🔕</div>
          <h1>Unsubscribed</h1>
          <p>${res.message}</p>
          <a href="/" class="btn">Return to Pricora Home &rarr;</a>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}

// RFC 8058 One-Click POST handler
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  const res = await handleUnsubscribe(token);

  return NextResponse.json({ success: res.success, message: res.message });
}
