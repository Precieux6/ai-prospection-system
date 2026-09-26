import puppeteer from "puppeteer";
import { marked } from "marked";
import { readFileSync } from "fs";
import { join } from "path";

export async function renderMarkdownToPDF(markdown: string): Promise<Buffer> {
  const htmlContent = await marked(markdown);
  const templatePath = join(__dirname, "templates", "cv.html");
  const template = readFileSync(templatePath, "utf-8");
  const fullHtml = template.replace("{{CONTENT}}", htmlContent);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}