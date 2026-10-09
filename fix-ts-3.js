const fs = require('fs');
const file = 'e:/WEB/Pricora/src/lib/data.ts';
let code = fs.readFileSync(file, 'utf8');

// I'll add the missing properties to each object inside MOCK_CATALOG
code = code.replace(/image_url: "(.*?)",/g, 'image_url: "$1",\n    model_number: null, gtin: null, images: [], lowest_price: null, lowest_price_store_id: null,');

fs.writeFileSync(file, code);
console.log("Added missing Product properties");
