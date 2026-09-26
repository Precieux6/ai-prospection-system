import * as cheerio from "cheerio";
import { fetchHtml } from "../anti-detect/scraper-api-client";

export interface Job {
  externalId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
}

export async function scrapeLinkedIn(keywords: string[], locations: string[]): Promise<Job[]> {
  const jobs: Job[] = [];
  const keyword = keywords[0] || "Developpeur";
  const location = locations[0] || "France";
  
  const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&f_TPR=r86400`;

  try {
    // LinkedIn nécessite le rendu JavaScript (render=true)
    const html = await fetchHtml(url, true);
    const $ = cheerio.load(html);

    $("div.job-card-container").each((_, el) => {
      const $el = $(el);
      const title = $el.find(".job-card-list__title").text().trim();
      const company = $el.find(".job-card-container__primary-description").text().trim();
      const locationText = $el.find(".job-card-container__metadata-wrapper").text().trim();
      const link = $el.find("a").attr("href") || "";

      if (title && company) {
        jobs.push({
          externalId: link.match(/\/jobs\/view\/(\d+)/)?.[1] || "",
          title,
          company,
          location: locationText,
          url: link.startsWith("http") ? link : `https://www.linkedin.com${link}`,
          source: "linkedin",
        });
      }
    });
  } catch (error) {
    console.error("Erreur scraping LinkedIn:", error);
  }

  return jobs.slice(0, 15);
}