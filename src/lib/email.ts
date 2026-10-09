import { Resend } from "resend";

// Initialize Resend with dummy key (would use env var in prod)
const resend = new Resend(process.env.RESEND_API_KEY ?? "re_dummy123");

export async function sendPriceDropEmail(
  email: string,
  productTitle: string,
  productUrl: string,
  oldPrice: number,
  newPrice: number,
  storeName: string
) {
  const formatPrice = (p: number) => "₹" + (p / 100).toLocaleString("en-IN");
  
  const dropPct = Math.round((1 - newPrice / oldPrice) * 100);

  const html = `
    <div style="font-family: sans-serif; max-w-xl; margin: 0 auto; padding: 20px;">
      <h2 style="color: #020204;">Price Drop Alert! 📉</h2>
      <p>Good news! The price for <strong>${productTitle}</strong> just dropped by <strong>${dropPct}%</strong> on ${storeName}.</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0; color: #64748b; text-decoration: line-through;">Old price: ${formatPrice(oldPrice)}</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #22c55e;">
          New price: ${formatPrice(newPrice)}
        </p>
      </div>

      <a href="${productUrl}" style="display: inline-block; background: #0FA37F; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
        View Deal Now
      </a>
      
      <p style="font-size: 12px; color: #94a3b8; margin-top: 40px;">
        You're receiving this because you subscribed to alerts for this product on Pricora.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Pricora Alerts <alerts@pricora.com>",
      to: [email],
      subject: `Price dropped to ${formatPrice(newPrice)} for ${productTitle}`,
      html,
    });

    if (error) {
      console.error("[Resend Error]", error);
      return false;
    }
    
    console.log("[Resend Success] Sent email id:", data?.id);
    return true;
  } catch (err) {
    console.error("[Resend Exception]", err);
    return false;
  }
}
