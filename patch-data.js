const fs = require('fs');

let content = fs.readFileSync('e:/WEB/Pricora/src/lib/data.ts', 'utf8');

const regex = /const MOCK_CATALOG: Product\[\] = \[([\s\S]*?)\];\s*function getMockProducts/;

const newCatalog = `const MOCK_CATALOG: Product[] = [
  {
    id: "p-iphone",
    title: "Apple iPhone 15 Pro (128GB) - Natural Titanium",
    slug: "apple-iphone-15-pro-128gb",
    description: "The ultimate iPhone with aerospace-grade titanium design, A17 Pro chip, and a more advanced 48MP main camera. Perfect festive upgrade.",
    brand_id: "b-apple",
    category_id: "c-smartphones",
    image_url: "https://m.media-amazon.com/images/I/81c50PU+lpL._SX679_.jpg",
    specs: { "Storage": "128GB", "Color": "Natural Titanium", "Processor": "A17 Pro", "Camera": "48MP Pro System" },
    highlights: ["Titanium Design", "Action Button", "USB-C", "ProMotion Display"],
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    brand: { id: "b-apple", name: "Apple", slug: "apple", created_at: "", updated_at: "" },
    category: { id: "c-smartphones", name: "Smartphones", slug: "smartphones", parent_id: null, created_at: "", updated_at: "" },
    store_listings: [
      { id: "l-i1", product_id: "p-iphone", store_id: "s-amazon", store_product_id: "B0CHX1W3S2", url: "https://amazon.in/dp/B0CHX1W3S2", store_title: "iPhone 15 Pro", current_price: 12799000, mrp: 13490000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[0], price_history: generateMockHistory(12799000, 60) },
      { id: "l-i2", product_id: "p-iphone", store_id: "s-flipkart", store_product_id: "FLPK-IPH15P", url: "https://flipkart.com/p/itmIPH15P", store_title: "iPhone 15 Pro", current_price: 12999000, mrp: 13490000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[1], price_history: generateMockHistory(12999000, 60) },
    ],
  },
  {
    id: "p-ps5",
    title: "Sony PlayStation 5 Console (Slim) - Disc Edition",
    slug: "sony-playstation-5-console-slim",
    description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback and 3D Audio, and an incredible generation of PlayStation games.",
    brand_id: "b-sony",
    category_id: "c-gaming",
    image_url: "https://m.media-amazon.com/images/I/51wXhD8eNXL._SX522_.jpg",
    specs: { "Storage": "1TB SSD", "Resolution": "4K 120Hz", "Edition": "Disc" },
    highlights: ["Slim Design", "DualSense Controller included", "Ray Tracing", "Tempest 3D AudioTech"],
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    brand: { id: "b-sony", name: "Sony", slug: "sony", created_at: "", updated_at: "" },
    category: { id: "c-gaming", name: "Gaming Consoles", slug: "gaming-consoles", parent_id: null, created_at: "", updated_at: "" },
    store_listings: [
      { id: "l-p1", product_id: "p-ps5", store_id: "s-amazon", store_product_id: "B0CLP41G8Q", url: "https://amazon.in/dp/B0CLP41G8Q", store_title: "Sony PS5 Console", current_price: 4999000, mrp: 5499000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[0], price_history: generateMockHistory(4999000, 60) },
      { id: "l-p2", product_id: "p-ps5", store_id: "s-flipkart", store_product_id: "FLPK-PS5SL", url: "https://flipkart.com/p/itmPS5SL", store_title: "PlayStation 5 Console", current_price: 4899000, mrp: 5499000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[1], price_history: generateMockHistory(4899000, 60) },
      { id: "l-p3", product_id: "p-ps5", store_id: "s-croma", store_product_id: "CRMA-PS5SL", url: "https://croma.com/p/PS5SL", store_title: "Sony PlayStation 5 Slim", current_price: 4999000, mrp: 5499000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 0.98, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[2], price_history: generateMockHistory(4999000, 60) },
    ],
  },
  {
    id: "p-macbook",
    title: "Apple MacBook Air 13-inch with M3 chip",
    slug: "apple-macbook-air-13-m3",
    description: "Supercharged by M3, the MacBook Air is super portable and delivers up to 18 hours of battery life for work and play.",
    brand_id: "b-apple",
    category_id: "c-laptops",
    image_url: "https://m.media-amazon.com/images/I/71jG+e7roXL._SX679_.jpg",
    specs: { "Processor": "Apple M3 (8-core)", "RAM": "8GB Unified", "Storage": "256GB SSD", "Display": "13.6-inch Liquid Retina" },
    highlights: ["M3 Chip", "Fanless Design", "1080p FaceTime HD Camera", "MagSafe 3"],
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    brand: { id: "b-apple", name: "Apple", slug: "apple", created_at: "", updated_at: "" },
    category: { id: "c-laptops", name: "Laptops", slug: "laptops", parent_id: null, created_at: "", updated_at: "" },
    store_listings: [
      { id: "l-m1", product_id: "p-macbook", store_id: "s-amazon", store_product_id: "B0CX21C26R", url: "https://amazon.in/dp/B0CX21C26R", store_title: "MacBook Air M3", current_price: 10490000, mrp: 11490000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[0], price_history: generateMockHistory(10490000, 60) },
      { id: "l-m2", product_id: "p-macbook", store_id: "s-croma", store_product_id: "CRMA-MBA3", url: "https://croma.com/p/MBA3", store_title: "Apple MacBook Air 13 M3", current_price: 10690000, mrp: 11490000, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[2], price_history: generateMockHistory(10690000, 60) },
    ],
  },
  {
    id: "p-s24",
    title: "Samsung Galaxy S24 Ultra 5G (Titanium Gray)",
    slug: "samsung-galaxy-s24-ultra-5g",
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.",
    brand_id: "b-samsung",
    category_id: "c-smartphones",
    image_url: "https://m.media-amazon.com/images/I/71RVuROhxGL._SX679_.jpg",
    specs: { "Storage": "256GB", "RAM": "12GB", "Camera": "200MP Quad", "Features": "Galaxy AI, S Pen" },
    highlights: ["Snapdragon 8 Gen 3", "Titanium Frame", "Live Translate", "Circle to Search"],
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    brand: { id: "b-samsung", name: "Samsung", slug: "samsung", created_at: "", updated_at: "" },
    category: { id: "c-smartphones", name: "Smartphones", slug: "smartphones", parent_id: null, created_at: "", updated_at: "" },
    store_listings: [
      { id: "l-s1", product_id: "p-s24", store_id: "s-amazon", store_product_id: "B0CQYMST3D", url: "https://amazon.in/dp/B0CQYMST3D", store_title: "Galaxy S24 Ultra", current_price: 11999900, mrp: 13499900, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[0], price_history: generateMockHistory(11999900, 60) },
      { id: "l-s2", product_id: "p-s24", store_id: "s-flipkart", store_product_id: "FLPK-S24U", url: "https://flipkart.com/p/itmS24U", store_title: "Samsung S24 Ultra", current_price: 12100000, mrp: 13499900, delivery_charge: 0, in_stock: true, match_method: "gtin", match_confidence: 1, last_checked_at: new Date().toISOString(), created_at: new Date().toISOString(), store: MOCK_STORES[1], price_history: generateMockHistory(12100000, 60) },
    ],
  },
];
function getMockProducts`;

content = content.replace(regex, newCatalog);
fs.writeFileSync('e:/WEB/Pricora/src/lib/data.ts', content);
