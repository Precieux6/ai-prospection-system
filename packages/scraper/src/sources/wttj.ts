import * as cheerio from "cheerio";
import { fetchHtml } from "../anti-detect/scraper-api-client";
import { Job } from "./linkedin";

export async function scrapeWTTJ(keywords: string[]): Promise<Job[]> {
  const jobs: Job[] = [];
  const keyword = keywords[0] || "Developpeur";

  const url = `https://www.welcometothejungle.com/fr/jobs?query=${encodeURIComponent(keyword)}`;

  try {
    // WTTJ est une SPA, il faut render=true
    const html = await fetchHtml(url, true);
    const $ = cheerio.load(html);

    $('a[data-testid="job-card-link"]').each((_, el) => {
      const $el = $(el);
      const title = $el.find("h3").text().trim();
      const company = $el.find('[data-testid="job-card-company"]').text().trim();
      const locationText = $el.find('[data-testid="job-card-location"]').text().trim();
      const link = $el.attr("href") || "";

      if (title && company) {
        jobs.push({
          externalId: link.split("/").pop() || "",
          title,
          company,
          location: locationText,
          url: `https://www.welcometothejungle.com${link}`,
          source: "wttj",
        });
      }
    });
  } catch (error) {
    console.error("Erreur scraping WTTJ:", error);
  }

  return jobs.slice(0, 15);
}