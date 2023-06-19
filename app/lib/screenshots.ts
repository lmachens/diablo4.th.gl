import edgeChromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function takeScreenshot(url: string) {
  const executablePath = await edgeChromium.executablePath;

  const browser = await puppeteer.launch({
    executablePath,
    args: edgeChromium.args,
    headless: false,
  });
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
