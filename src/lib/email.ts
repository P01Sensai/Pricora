import { Resend } from "resend";
import { supabaseAdmin } from "./supabase-admin";

const resendApiKey = process.env.RESEND_API_KEY;
const isLiveResend = Boolean(resendApiKey && !resendApiKey.startsWith("re_dummy"));
const resend = new Resend(resendApiKey || "re_dummy_fallback");

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.ALERT_FROM_EMAIL || "Pricora Alerts <alerts@pricora.com>";

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send Double Opt-In (DOI) Confirmation Email to verify subscription ownership
 */
export async function sendConfirmationEmail(
  email: string,
  productTitle: string,
  confirmToken: string,
  unsubscribeToken: string
): Promise<EmailResult> {
  const confirmUrl = `${APP_URL}/api/alerts/confirm?token=${encodeURIComponent(confirmToken)}`;
  const unsubscribeUrl = `${APP_URL}/api/alerts/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 32px 16px; }
          .container { max-width: 560px; margin: 0 auto; background: #121215; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px 32px; }
          .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; margin-bottom: 24px; display: inline-block; }
          .title { font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3; margin: 0 0 16px 0; }
          .text { font-size: 15px; color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0; }
          .product-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; margin-bottom: 28px; }
          .product-title { font-size: 15px; font-weight: 600; color: #e4e4e7; margin: 0; }
          .btn { display: inline-block; background: #22c55e; color: #000000; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 10px; }
          .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #71717a; line-height: 1.5; }
          .footer a { color: #a1a1aa; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">PRICORA<span style="color:#22c55e">.</span></div>
          <h1 class="title">Confirm Your Price Drop Alert</h1>
          <p class="text">We received a request to monitor price drops across Amazon, Flipkart, and Croma for:</p>
          
          <div class="product-box">
            <p class="product-title">${productTitle}</p>
          </div>

          <p class="text">Please confirm your subscription so we can notify you the instant the price drops below your target:</p>

          <a href="${confirmUrl}" class="btn">Confirm Alert Subscription</a>

          <div class="footer">
            <p>If you didn't request this alert, you can safely ignore this email or <a href="${unsubscribeUrl}">unsubscribe instantly</a>.</p>
            <p>&copy; ${new Date().getFullYear()} Pricora Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!isLiveResend) {
    console.log(`[Pricora Email Mock - DOI] To: ${email} | Product: "${productTitle}"`);
    console.log(`[Pricora Email Mock - DOI] Confirm Link: ${confirmUrl}`);
    return { success: true, messageId: `mock-doi-${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `Confirm price alert for ${productTitle.slice(0, 40)}...`,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) {
      console.error("[Resend Error - DOI]", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("[Resend Exception - DOI]", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Price Drop Notification Email to an active subscriber
 */
export async function sendPriceDropEmail(
  email: string,
  productTitle: string,
  productUrl: string,
  oldPricePaise: number,
  newPricePaise: number,
  storeName: string,
  unsubscribeToken: string
): Promise<EmailResult> {
  const formatPrice = (p: number) => "₹" + Math.round(p / 100).toLocaleString("en-IN");
  const savings = Math.max(0, oldPricePaise - newPricePaise);
  const dropPct = oldPricePaise > 0 ? Math.round((savings / oldPricePaise) * 100) : 0;
  const unsubscribeUrl = `${APP_URL}/api/alerts/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 32px 16px; }
          .container { max-width: 560px; margin: 0 auto; background: #121215; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px 32px; }
          .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; margin-bottom: 24px; display: inline-block; }
          .badge { display: inline-block; background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
          .title { font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.25; margin: 0 0 16px 0; }
          .product-title { font-size: 16px; color: #d4d4d8; font-weight: 500; margin: 0 0 24px 0; line-height: 1.5; }
          .price-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; }
          .old-price { font-size: 15px; color: #71717a; text-decoration: line-through; margin: 0 0 6px 0; }
          .new-price { font-size: 32px; font-weight: 800; color: #22c55e; margin: 0; line-height: 1; }
          .store-tag { font-size: 13px; color: #a1a1aa; margin: 10px 0 0 0; }
          .btn { display: inline-block; background: #22c55e; color: #000000; font-weight: 700; font-size: 16px; text-decoration: none; padding: 14px 32px; border-radius: 10px; }
          .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #71717a; line-height: 1.5; }
          .footer a { color: #a1a1aa; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">PRICORA<span style="color:#22c55e">.</span></div>
          <br>
          <div class="badge">🔥 PRICE DROP DETECTED — ${dropPct}% OFF</div>
          <h1 class="title">Price Drop Alert!</h1>
          <p class="product-title">${productTitle}</p>

          <div class="price-card">
            <p class="old-price">Was: ${formatPrice(oldPricePaise)}</p>
            <p class="new-price">${formatPrice(newPricePaise)}</p>
            <p class="store-tag">Available now on <strong>${storeName}</strong> • You save ${formatPrice(savings)}</p>
          </div>

          <a href="${productUrl}" class="btn">View Live Deal Now &rarr;</a>

          <div class="footer">
            <p>You received this alert because you subscribed to price drops for this product on Pricora.</p>
            <p><a href="${unsubscribeUrl}">Unsubscribe from alerts for this item</a> with one click.</p>
            <p>&copy; ${new Date().getFullYear()} Pricora Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!isLiveResend) {
    console.log(`[Pricora Email Mock - Drop] To: ${email} | New: ${formatPrice(newPricePaise)} (was ${formatPrice(oldPricePaise)}) on ${storeName}`);
    console.log(`[Pricora Email Mock - Drop] Deal Link: ${productUrl}`);
    return { success: true, messageId: `mock-drop-${Date.now()}` };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `📉 Price dropped to ${formatPrice(newPricePaise)} on ${storeName}! (${productTitle.slice(0, 30)})`,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) {
      console.error("[Resend Error - Drop]", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("[Resend Exception - Drop]", err);
    return { success: false, error: err.message };
  }
}

/**
 * Alert Evaluation Engine:
 * Evaluates whether an updated product price triggers notifications for active subscribers,
 * respecting the strict 24-hour suppression cooldown.
 */
export async function evaluatePriceDropAlerts(
  productId: string,
  newPricePaise: number,
  oldPricePaise: number,
  storeName: string,
  productTitle: string,
  productUrl: string
): Promise<{ evaluated: number; sent: number }> {
  try {
    // 1. Fetch active subscribers whose target_price >= newPricePaise
    const { data: subscribers, error } = await supabaseAdmin
      .from("alert_subscribers")
      .select("alert_id, email, target_price, manage_token_hash, triggered_at")
      .eq("product_id", productId)
      .eq("status", "active")
      .gte("target_price", newPricePaise);

    if (error || !subscribers || subscribers.length === 0) {
      return { evaluated: 0, sent: 0 };
    }

    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    let sentCount = 0;

    for (const sub of subscribers) {
      // 2. Cooldown check: Suppress if notified in the past 24 hours
      if (sub.triggered_at) {
        const lastTriggered = new Date(sub.triggered_at).getTime();
        if (now - lastTriggered < TWENTY_FOUR_HOURS_MS) {
          continue; // Cooldown active, skip email
        }
      }

      // 3. Dispatch Price Drop Email
      const result = await sendPriceDropEmail(
        sub.email,
        productTitle,
        productUrl,
        oldPricePaise,
        newPricePaise,
        storeName,
        sub.manage_token_hash
      );

      if (result.success) {
        sentCount++;
        // 4. Update triggered_at timestamp in Supabase
        await supabaseAdmin
          .from("alert_subscribers")
          .update({
            triggered_at: new Date().toISOString(),
            status: "active", // Keep active so future price drops still register after cooldown
            updated_at: new Date().toISOString(),
          })
          .eq("alert_id", sub.alert_id);
      }
    }

    return { evaluated: subscribers.length, sent: sentCount };
  } catch (err) {
    console.error("[Alert Evaluation Engine Error]", err);
    return { evaluated: 0, sent: 0 };
  }
}
