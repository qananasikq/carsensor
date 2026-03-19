const dotenv = require("dotenv");
const { chromium } = require("playwright");
const { connectDb, Car } = require("./db");
const { collectCarLinks, parseCarDetail } = require("./parser");
const { pauseBetweenRequests } = require("./normalizers");

dotenv.config();

async function runWorker() {
  console.log("Scraper started");
  await connectDb();

  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== "false"
  });

  const context = await browser.newContext({
    locale: "ja-JP",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();

  try {
    const startUrl = process.env.SCRAPER_START_URL;
    const maxCars = Number(process.env.SCRAPER_MAX_CARS || 24);
    const maxPages = Number(process.env.SCRAPER_MAX_PAGES || 3);

    const listingLinks = await collectCarLinks(page, startUrl, maxPages, maxCars);
    console.log(`Found ${listingLinks.length} listings`);

    let saved = 0;

    for (const listing of listingLinks) {
      try {
        await pauseBetweenRequests();
        const car = await parseCarDetail(page, listing);
        await Car.updateOne(
          { sourceId: car.sourceId },
          { $set: car },
          { upsert: true }
        );
        saved += 1;
        console.log(`Saved ${car.brand} ${car.model} (${car.sourceId})`);
      } catch (error) {
        console.error(`Failed to parse ${listing.url}:`, error.message);
      }
    }

    console.log(`Finished. Saved ${saved} cars`);
  } finally {
    await browser.close();
  }
}

module.exports = { runWorker };

if (require.main === module) {
  runWorker()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Scraper stopped with error:", error);
      process.exit(1);
    });
}
