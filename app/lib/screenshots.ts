import puppeteer from "puppeteer";

export async function takeScreenshot(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 628 });
  await page.goto(url, {
    waitUntil: "networkidle0",
  });
  await page.emulateMediaType("print");
  const screenshot = await page.screenshot({ fullPage: true, type: "webp" });
  await browser.close();
  return screenshot;
}
