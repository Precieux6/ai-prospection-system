import * as cheerio from "cheerio";
import { fetchHtml } from "../anti-detect/scraper-api-client";
import { Job } from "./linkedin";

export async function scrapeIndeed(keywords: string[], locations: string[]): Promise<Job[]> {
  const jobs: Job[] = [];
  const keyword = keywords[0] || "Developpeur";
  const location = locations[0] || "";

  const url = `https://fr.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location)}&fromage=1`;

  try {
    // Indeed fonctionne souvent sans rendu JS (render=false pour économiser les crédits)
    const html = await fetchHtml(url, false);
    const $ = cheerio.load(html);

    $(".job_seen_beacon").each((_, el) => {
      const $el = $(el);
      const title = $el.find("h2.jobTitle").text().trim();
      const company = $el.find(".companyName").text().trim();
      const locationText = $el.find(".companyLocation").text().trim();
      const link = $el.find("h2.jobTitle a").attr("href") || "";

      if (title && company) {
        jobs.push({
          externalId: link.match(/jk=([a-f0-9]+)/)?.[1] || "",
          title,
          company,
          location: locationText,
          url: link.startsWith("http") ? link : `https://fr.indeed.com${link}`,
          source: "indeed",
        });
      }
    });
  } catch (error) {
    console.error("Erreur scraping Indeed:", error);
  }

  return jobs.slice(0, 15);
}