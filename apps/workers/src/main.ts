import "dotenv/config";
import cron from "node-cron";
import { db, users, userSettings, targets, deliverables } from "@repo/db";
import { eq } from "drizzle-orm";
import { ensureCollection, retrieveRelevantChunks, generateText, getScoringPrompt, getCVGenerationPrompt, getCoverLetterPrompt } from "@repo/ai";
import { scrapeLinkedIn, scrapeIndeed, scrapeWTTJ } from "@repo/scraper";
import { renderMarkdownToPDF } from "@repo/pdf";
import { uploadFile } from "@repo/storage";
import { sendEmail } from "@repo/email";

// --- 1. INITIALISATION ---
async function init() {
  console.log(" Démarrage du système IA Prospection...");
  await ensureCollection();
  console.log("✅ Base de données vectorielle (Qdrant) prête.");
  setupCronJobs();
}

// --- 2. CONFIGURATION DU CYCLE 24H (CRON) ---
function setupCronJobs() {
  // 00h00 : Veille et Scraping nocturne
  cron.schedule("0 0 * * *", async () => {
    console.log("\n🌙 [00h00] Démarrage du cycle nocturne (Scraping + IA)...");
    await runNightlyCycle();
  });

  // 08h30 : Notification pour validation humaine (Simulation)
  cron.schedule("30 8 * * *", async () => {
    console.log("\n☀️ [08h30] Envoi des notifications de validation...");
    await sendValidationNotifications();
  });

  // 09h30 : Envoi stratégique (Simulation)
  cron.schedule("30 9 * * *", async () => {
    console.log("\n🚀 [09h30] Démarrage des envois stratégiques...");
    await runSendingCycle();
  });

  console.log("⏰ Crons planifiés. En attente...");
}

// --- 3. LOGIQUE DU CYCLE NOCTURNE (00h00) ---
async function runNightlyCycle() {
  const activeUsers = await db.select().from(users).where(eq(users.isActive, true));

  for (const user of activeUsers) {
    console.log(`\n👤 Traitement pour : ${user.fullName}`);

    const settings = (await db.select().from(userSettings).where(eq(userSettings.userId, user.id)))[0];
    if (!settings) continue;

    let scrapedJobs: any[] = [];

    // A. Scraping Multi-sources
    if (settings.jobSearchSources?.includes("linkedin")) {
      const jobs = await scrapeLinkedIn(settings.jobSearchKeywords || [], settings.jobSearchLocations || []);
      scrapedJobs.push(...jobs.map(j => ({ ...j, source: "linkedin" })));
    }

    if (settings.jobSearchSources?.includes("indeed")) {
      const jobs = await scrapeIndeed(settings.jobSearchKeywords || [], settings.jobSearchLocations || []);
      scrapedJobs.push(...jobs.map(j => ({ ...j, source: "indeed" })));
    }

    if (settings.jobSearchSources?.includes("wttj")) {
      const jobs = await scrapeWTTJ(settings.jobSearchKeywords || []);
      scrapedJobs.push(...jobs.map(j => ({ ...j, source: "wttj" })));
    }

    console.log(`🕷️ ${scrapedJobs.length} offres brutes extraites.`);

    const today = new Date().toISOString().split("T")[0];

    // B. Analyse IA et Génération (Top 5 pour le test local)
    for (const job of scrapedJobs.slice(0, 5)) {
      try {
        // 1. RAG : Récupération du contexte utilisateur
        const query = `${job.title} ${job.company}`;
        const userContext = await retrieveRelevantChunks(user.id, query, 3);
        const contextText = userContext.join("\n");

        // 2. Scoring IA
        const scorePrompt = getScoringPrompt(contextText, job.title, "Description non disponible pour le test");
        const scoreRes = JSON.parse(await generateText(scorePrompt, true));

        // 3. Sauvegarde en base avec vérification null
        const inserted = await db.insert(targets).values({
          userId: user.id,
          type: "job",
          source: job.source,
          externalId: job.externalId,
          externalUrl: job.url,
          title: job.title,
          companyName: job.company,
          location: job.location,
          aiMatchScore: scoreRes.score,
          aiMatchReasoning: scoreRes.reasoning,
          aiRelevanceTags: scoreRes.tags,
          status: "pending_review",
          batchDate: today,
        }).returning();

        const [target] = inserted;

        if (!target) {
          console.error(`❌ Échec de l'insertion pour l'offre : ${job.title} chez ${job.company}`);
          continue;
        }

        // 4. Génération des livrables (CV + Lettre)
        const cvPrompt = getCVGenerationPrompt(contextText, job.title, "Description...");
        const cvMarkdown = await generateText(cvPrompt);

        const letterPrompt = getCoverLetterPrompt(contextText, job.title, job.company, "Description...");
        const letter = await generateText(letterPrompt);

        // Génération PDF
        const pdfBuffer = await renderMarkdownToPDF(cvMarkdown);
        const pdfUrl = await uploadFile(`cvs/${user.id}/${target.id}.pdf`, pdfBuffer, "application/pdf");

        await db.insert(deliverables).values([
          { targetId: target.id, userId: user.id, type: "cv_markdown", content: cvMarkdown },
          { targetId: target.id, userId: user.id, type: "cv_pdf_url", fileUrl: pdfUrl, content: pdfUrl },
          { targetId: target.id, userId: user.id, type: "cover_letter", content: letter },
        ]);

        console.log(`✅ Généré pour : ${job.title} chez ${job.company} (Score: ${scoreRes.score})`);
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de l'offre ${job.title} :`, error);
      }
    }
  }

  console.log("\n🏁 Cycle nocturne terminé. Prêt pour la validation de 08h30.");
}

// --- 4. NOTIFICATIONS (08h30) ---
async function sendValidationNotifications() {
  const activeUsers = await db.select().from(users).where(eq(users.isActive, true));

  for (const user of activeUsers) {
    await sendEmail(
      user.email,
      "️ Vos opportunités du jour sont prêtes !",
      `<h2>Bonjour ${user.fullName},</h2><p>10 offres ont été analysées et vos CVs sont prêts. Connectez-vous avant 09h30 pour valider les envois.</p>`
    );
    console.log(`📧 Email de validation envoyé à ${user.email}`);
  }
}

// --- 5. ENVOIS STRATÉGIQUES (09h30) ---
async function runSendingCycle() {
  // Ici, on récupérerait les targets avec status "approved" pour les envoyer.
  console.log(" En attente de l'approbation humaine via le dashboard...");
}

// Lancement
init().catch(console.error);

// Pour tester manuellement sans attendre minuit, décommente la ligne ci-dessous :
// runNightlyCycle();