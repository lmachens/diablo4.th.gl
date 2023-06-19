export async function takeScreenshot(url: string) {
  const response = await fetch(
    `https://chrome.browserless.io/screenshot?token=${process.env.BROWSERLESS_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        url: url,
        options: {
          fullPage: true,
          type: "jpeg",
          quality: 75,
        },
      }),
    }
  );
  const result = await response.arrayBuffer();
  return result;
}
