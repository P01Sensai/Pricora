const fs = require('fs');

function replaceInFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/iPhone 15/g, 'iPhone 17');
  fs.writeFileSync(file, code);
}

replaceInFile('e:/WEB/Pricora/src/app/page.tsx');
replaceInFile('e:/WEB/Pricora/src/app/search/page.tsx');
console.log("Updated UI tags to iPhone 17");
