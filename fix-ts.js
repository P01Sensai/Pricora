const fs = require('fs');
const file = 'e:/WEB/Pricora/src/lib/data.ts';
let code = fs.readFileSync(file, 'utf8');

// The error is: 'created_at' does not exist in type 'Brand' / 'Category'
// I'll just remove `, created_at: "", updated_at: ""` from all those objects
code = code.replace(/, created_at: "", updated_at: ""/g, '');

fs.writeFileSync(file, code);
console.log("Fixed TS errors");
