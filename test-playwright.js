const { AmazonConnector } = require('./workers/connectors/amazon');

async function test() {
  const amazon = new AmazonConnector();
  console.log("Searching...");
  const results = await amazon.search('iphone 15');
  console.log(JSON.stringify(results, null, 2));
}

test().catch(console.error);
