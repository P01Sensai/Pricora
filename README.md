<div align="center">

  # ⚡ PRICORA
  ### *Real-Time E-Commerce Price Comparison Engine for India*

  <p align="center">
    <strong>Stop opening 10 browser tabs. Search once. Find the authentic lowest price across Amazon India, Flipkart & Croma instantly.</strong>
  </p>

  <p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
    <a href="https://cheerio.js.org"><img src="https://img.shields.io/badge/Cheerio-Scraping-E88A1A?style=for-the-badge" alt="Cheerio" /></a>
    <a href="https://recharts.org"><img src="https://img.shields.io/badge/Recharts-Analytics-22c55e?style=for-the-badge" alt="Recharts" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="#license"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" /></a>
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-store-connectors--scraping-engine">Scraper Engine</a> •
    <a href="#-algorithmic-deal-scoring">Deal Scoring</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-tech-stack">Tech Stack</a>
  </p>

</div>

---

## 🌟 The Pricora Advantage

Indian e-commerce is plagued by fluctuating festive prices, misleading discounts, and artificial urgency timers. **Pricora** solves this by scraping, aggregating, and analyzing live prices in real time, giving consumers authentic historical data and algorithmic buying advice.

| Traditional Shopping Pain | The Pricora Solution |
| :--- | :--- |
| **Tab Overload**: 5+ tabs open comparing prices manually | **Unified View**: Side-by-side pricing from Amazon, Flipkart & Croma in one tap |
| **Fake Discounts**: Inflated MRPs during festive sales | **60-Day Price History**: Visual charts exposing real historical lows vs. fake drops |
| **FOMO Manipulation**: Unverified countdown timers | **Algorithmic Deal Score**: Objective 0–100 score analyzing market spread & savings |
| **Missed Drops**: Midnight flash sales sell out in minutes | **Instant Alerts**: Targeted email notifications the second a price drops below budget |
| **Cluttered Interfaces**: Ads, popups, and bloatware | **Vibrant Cyberpunk UI**: Fast, responsive, ambient aurora design built with Tailwind CSS v4 |

---

## ⚡ Key Features

### 1. 🔍 Instant Keystroke Autocomplete
- Ultra-responsive, debounced (`180ms`) live search suggestions powered by `/api/suggestions`.
- Live thumbnail preview, brand categorization, store availability count, and instant lowest price.
- Full keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`) and outside-click dismiss.

### 2. 🪔 Vibrant Ambient Aurora & 3D Hero Carousel
- Built with hardware-accelerated 3D mathematical ring projection (`perspective: 1200px`, `Math.sin`, `Math.cos`).
- Dynamic ambient aurora lighting using multi-layer radial blurs (Electric Cyan, Rose Magenta, Golden Amber, Deep Violet).
- Category quick-launch pills with glowing jewel tones:
  - 🪔 *Festive Mega Deals* • 📱 *Smartphones* • 💻 *Laptops & PCs*
  - 🎧 *Audio & Headphones* • 🎮 *Gaming & Consoles* • ⌚ *Wearables* • 📺 *Appliances*

### 3. 🛍️ Real-Time Multi-Store Comparison
- Automatically matches products across **Amazon India**, **Flipkart**, and **Croma**.
- Direct tracking of stock status, delivery fees, and promotional discounts.
- Highlights the verified **`★ BEST PRICE`** with clear savings badges (`-35% OFF`, `-56% OFF`).

### 4. 🧠 Algorithmic Deal Scoring Engine
Proprietary scoring function (`calculateDealScore`) evaluating market conditions:
- **0 - 39 (Poor / Overpriced)**: Price is above average; advises to wait.
- **40 - 59 (Fair)**: Standard market price; minimal active discount.
- **60 - 79 (Good Deal)**: Substantial discount below historical average.
- **80 - 100 (Unreal Steal 🔥)**: Historical low with extreme market spread; buy immediately.

### 5. 📉 60-Day Interactive Historical Price Tracking
- High-performance vector charts powered by **Recharts**.
- Compare store-by-store historical fluctuations across customizable date ranges.
- Dark glassmorphic tooltips displaying precise date and currency format (`₹`).

### 6. 🔔 Instant Price Drop Email Alerts
- Floating right sidebar alert module connected to `/api/alerts/subscribe`.
- One-click threshold setting: users enter their email and target price to receive instant webhook triggers.

### 7. 🛡️ Safe Outbound Affiliate Gateway
- Centralized redirect controller (`/out/[id]`) that logs click conversions, applies store affiliate tags, and redirects with zero tracking delay.

### 8. 📊 Real-Time Admin Telemetry Dashboard
- Dedicated `/admin` monitoring console.
- Real-time scrapers health status (Cheerio engine status).
- Metrics tracking: total catalog products, multi-store listings, and live click conversions.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A["User / Browser Client"] -->|Instant Search & Filter| B["Next.js App Router Frontend"]
    B -->|Fetch Suggestions| C["/api/suggestions"]
    B -->|Search Query| D["/api/search"]
    B -->|Set Price Alert| E["/api/alerts/subscribe"]
    B -->|Outbound Buy Click| F["/out/:listingId"]
    
    subgraph Core_Engine ["Core Pricing & Scraper Engine"]
        G["Cheerio Web Scrapers"] -->|Ingest Product Pages| H["Store Connectors: Amazon, Flipkart, Croma"]
        H -->|Normalize & De-duplicate| I["Product Catalog & Ingestion Pipeline"]
        I -->|Historical Pricing Time-Series| J[("PostgreSQL / Supabase")]
    end
    
    C --> I
    D --> I
    F -->|Log Click Telemetry| K["Conversion Analytics Logger"]
    F -->|Redirect to Store with Affiliate Tag| L["Merchant Storefront Checkout"]
```

---

## 📂 Project Structure

```bash
Pricora/
├── database/
│   └── schema.sql             # PostgreSQL schema (stores, products, listings, price history, clicks)
├── public/                    # Static assets & web manifests
├── src/
│   ├── app/
│   │   ├── admin/             # Live Telemetry & Health Dashboard (/admin)
│   │   ├── api/
│   │   │   ├── alerts/        # Price Drop Alert Subscription (/api/alerts/subscribe)
│   │   │   ├── search/        # Real-time multi-query search endpoint (/api/search)
│   │   │   └── suggestions/   # Keystroke autocomplete endpoint (/api/suggestions)
│   │   ├── out/[id]/          # Outbound affiliate redirector & click logger (/out)
│   │   ├── product/[slug]/    # Dynamic Product Details & Price Comparison page
│   │   ├── search/            # Search results grid with filters & sorting
│   │   ├── globals.css        # Tailwind CSS v4 design tokens & aurora animations
│   │   ├── layout.tsx         # Root layout with Google Fonts (Inter, Poppins, Playfair)
│   │   └── page.tsx           # Homepage with 3D carousel, ticker & deal showcase
│   ├── components/
│   │   ├── Navbar.tsx         # Responsive header
│   │   ├── PriceAlertForm.tsx # Client price drop subscription form
│   │   ├── PriceHistoryChart.tsx # 60-day interactive Recharts graph
│   │   └── SearchBar.tsx      # Dual-mode (Hero/Header) autocomplete search component
│   └── lib/
│       ├── catalog-data.ts    # Curated, verified catalog with 130+ multi-store products
│       ├── data.ts            # Catalog accessors, search filtering & click logging
│       ├── deal-score.ts      # Algorithmic verdict & deal scoring engine
│       └── types.ts           # Unified TypeScript interfaces
└── workers/
    ├── connectors/
    │   ├── amazon.ts          # Amazon India Cheerio scraper with stealth headers
    │   ├── flipkart.ts        # Flipkart Cheerio scraper
    │   └── croma.ts           # Croma connector
    └── index.ts               # Background worker runner
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/P01Sensai/Pricora.git
cd Pricora
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase / Database (Optional for in-memory mode)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://user:password@localhost:5432/pricora

# Email Alerts (Optional - Resend)
RESEND_API_KEY=your_resend_key
```

### 4. Run Development Server
```bash
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🔌 Store Connectors & Scraping Engine

Pricora implements robust scrapers in `workers/connectors/` designed specifically for Indian e-commerce layouts:

```typescript
// Example: Amazon Connector with Anti-Bot Headers
const response = await fetch(url, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
    "Accept-Language": "en-IN,en;q=0.9",
    "Referer": "https://www.google.com/",
  },
});
const $ = cheerio.load(await response.text());
const priceText = $(".a-price-whole").first().text().replace(/[,.]/g, "");
const pricePaise = parseInt(priceText, 10) * 100;
```

### Supported Stores
- 🟠 **Amazon India (`amazon.in`)**: Tracks Prime deals, lightning sales, delivery costs, and stock states.
- 🔵 **Flipkart (`flipkart.com`)**: Parses Big Billion Days drops, exchange offers, and assured badges.
- 🟢 **Croma (`croma.com`)**: Scrapes official electronics distributor pricing for authentic warranty comparison.

---

## 📊 Algorithmic Deal Scoring

The scoring engine (`src/lib/deal-score.ts`) calculates a real-time rating between `0` and `100`:

$$\text{Spread} = \frac{\text{Highest Price} - \text{Lowest Price}}{\text{Highest Price}}$$

$$\text{Discount} = \frac{\text{MRP} - \text{Lowest Price}}{\text{MRP}}$$

```typescript
if (discount >= 0.40 && spread >= 0.15) {
  return { score: 92, verdict: "Unreal Steal 🔥" };
} else if (discount >= 0.20 || spread >= 0.10) {
  return { score: 78, verdict: "Great Deal ✨" };
} else if (discount >= 0.08) {
  return { score: 62, verdict: "Good Value 👍" };
} else {
  return { score: 45, verdict: "Fair Market Price" };
}
```

---

## 📡 API Reference

### 1. Instant Search
```http
GET /api/search?q={query}
```
**Response:**
```json
{
  "products": [
    {
      "id": "p-1",
      "title": "Apple iPhone 17 Pro (128GB)",
      "slug": "apple-iphone-17-pro-128gb",
      "lowest_price": 12799900,
      "store_listings": [
        { "store": { "name": "Amazon India", "slug": "amazon" }, "current_price": 12799900, "in_stock": true },
        { "store": { "name": "Flipkart", "slug": "flipkart" }, "current_price": 12899900, "in_stock": true }
      ]
    }
  ]
}
```

### 2. Autocomplete Suggestions
```http
GET /api/suggestions?q={prefix}
```

### 3. Price Drop Alert Subscription
```http
POST /api/alerts/subscribe
Content-Type: application/json

{
  "email": "shopper@example.com",
  "product_id": "p-1",
  "current_price": 12799900
}
```

### 4. Outbound Affiliate Redirector
```http
GET /out/{listingId}
```
*Appends tracking tags, records click timestamp in telemetry, and redirects directly to merchant product URL via HTTP 302.*

---

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org) | Modern React framework using App Router & Server Components |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) | Strict type safety across frontend and scraping workers |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) | Next-generation CSS engine with custom ambient aurora tokens |
| **Visuals** | [Google Fonts](https://fonts.google.com) | *Inter*, *Poppins*, and *Playfair Display* typography |
| **Scraper** | [Cheerio](https://cheerio.js.org) | Fast, flexible HTML parsing for real-time extraction |
| **Visual Charts** | [Recharts](https://recharts.org) | Declarative SVG price tracking time-series visualizations |
| **Database** | [PostgreSQL / Supabase](https://supabase.com) | Relational storage for products, stores, and price history |
| **Worker Queue** | [BullMQ & Redis](https://bullmq.io) | Scheduled price scraping and monitoring jobs |

---

## 🗺️ Roadmap

- [x] **Phase 1**: High-end cyberpunk design system with ambient aurora glows.
- [x] **Phase 2**: Multi-store scraper connectors (Amazon India, Flipkart, Croma).
- [x] **Phase 3**: Instant keystroke search suggestions & debounced autocomplete.
- [x] **Phase 4**: 60-day interactive price history graph (Recharts).
- [x] **Phase 5**: Algorithmic Deal Scoring Engine (`0-100` verdict).
- [x] **Phase 6**: Outbound affiliate click tracking & redirect controller (`/out/[id]`).
- [x] **Phase 7**: Real-time system health & admin monitoring dashboard (`/admin`).
- [ ] **Phase 8**: Telegram & WhatsApp bot triggers for instant price crash alerts.
- [ ] **Phase 9**: Chrome Extension for in-browser real-time price comparison overlays.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with ❤️ for Indian smart shoppers. Powered by Next.js, Cheerio & Tailwind CSS.</sub>
</div>
