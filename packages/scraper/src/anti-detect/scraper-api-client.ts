import puppeteer from "puppeteer";

export async function fetchHtml(url: string, options?: any): Promise<string> {  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Configure le User-Agent pour éviter la détection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Configure la taille de la fenêtre
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigue vers l'URL avec un timeout de 30s
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Attend un peu pour que le JavaScript se charge
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Récupère le HTML
    const html = await page.content();
    
    return html;
  } finally {
    await browser.close();
  }
}