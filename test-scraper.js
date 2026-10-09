const cheerio = require("cheerio");

async function testAmazonScraper() {
  const url = "https://www.amazon.in/s?k=great+indian+festival+deals";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "Accept-Language": "en-IN,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      }
    });
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const products = [];
    $('[data-component-type="s-search-result"]').each((i, el) => {
      const title = $(el).find('h2 a span').text().trim();
      const priceStr = $(el).find('.a-price-whole').first().text().replace(/[,.]/g, '');
      const img = $(el).find('img.s-image').attr('src');
      const link = $(el).find('h2 a').attr('href');
      
      if (title && priceStr) {
        products.push({
          title,
          price: parseInt(priceStr, 10),
          img,
          url: "https://amazon.in" + link
        });
      }
    });
    
    console.log("Scraped products count:", products.length);
    console.log("Scraped products:", products.slice(0, 5));
  } catch (err) {
    console.error(err);
  }
}

testAmazonScraper();
