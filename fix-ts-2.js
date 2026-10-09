const fs = require('fs');
const file = 'e:/WEB/Pricora/src/lib/data.ts';
let code = fs.readFileSync(file, 'utf8');

// The error is: 'description' does not exist in type 'Product'
// I'll remove all description lines
code = code.replace(/^\s*description: ".*",\n/gm, '');

fs.writeFileSync(file, code);
console.log("Removed descriptions");
