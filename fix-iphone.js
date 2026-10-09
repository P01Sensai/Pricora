const fs = require('fs');
const file = 'e:/WEB/Pricora/src/lib/data.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace iPhone 15 with iPhone 17
code = code.replace(/iPhone 15 Pro/g, 'iPhone 17 Pro');
code = code.replace(/iphone-15-pro/g, 'iphone-17-pro');
code = code.replace(/IPH15P/g, 'IPH17P');

// Update the specs to make it feel futuristic/current for 2026
code = code.replace(/"Processor": "A17 Pro"/g, '"Processor": "A19 Pro"');
code = code.replace(/"A17 Pro chip"/g, '"A19 Pro chip"');

fs.writeFileSync(file, code);
console.log("Updated iPhone 15 to iPhone 17");
