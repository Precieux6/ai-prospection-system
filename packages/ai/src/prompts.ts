// --- MODULE 1 : CANDIDATURES ---

export function getScoringPrompt(profileContext: string, jobTitle: string, jobDescription: string): string {
  return `Tu es un expert en recrutement. Évalue la compatibilité entre ce candidat et cette offre de 0 à 100.
  
Profil du candidat :
${profileContext}

Offre d'emploi : ${jobTitle}
Description : ${jobDescription}

Réponds UNIQUEMENT en JSON valide avec ce format :
{"score": number, "reasoning": "string (2 phrases max)", "tags": ["string"]}
Ne mets rien d'autre que le JSON.`;
}

export function getCVGenerationPrompt(profileContext: string, jobTitle: string, jobDescription: string): string {
  return `Tu es un expert en rédaction de CV. Adapte le CV du candidat pour l'offre suivante.
Règles : Ne mens jamais. Réordonne les expériences par pertinence. Utilise les mots-clés de l'offre. Format Markdown strict.

Profil :
${profileContext}

Offre : ${jobTitle}
Description : ${jobDescription}

Génère le CV en Markdown.`;
}

export function getCoverLetterPrompt(profileContext: string, jobTitle: string, companyName: string, jobDescription: string): string {
  return `Rédige une lettre de motivation percutante (3 paragraphes max, 250 mots).
Cite 2 détails précis de l'offre. Ton professionnel mais authentique. Pas de formules bateaux.

Profil :
${profileContext}

Offre : ${jobTitle} chez ${companyName}
Description : ${jobDescription}

Génère la lettre.`;
}

// --- MODULE 2 : PROSPECTION B2B ---

export function getB2BAuditPrompt(websiteContent: string): string {
  return `Tu es un consultant senior en stratégie digitale. Analyse ce contenu de site web.
Contenu :
${websiteContent.substring(0, 15000)}

Réponds UNIQUEMENT en JSON :
{"overall_score": number, "weaknesses": ["string"], "top_opportunity": "string", "icebreaker_hook": "string (phrase d'accroche personnalisée)"}
Ne mets rien d'autre que le JSON.`;
}

export function getB2BEmailPrompt(prospectName: string, companyName: string, auditFindings: string, valueProp: string): string {
  return `Rédige un email de prospection B2B ultra-personnalisé (150 mots max).
Règles : Objet court. Commence par une observation précise (pas de compliment générique). Mentionne une faille identifiée. CTA faible friction.

Prospect : ${prospectName} (${companyName})
Audit : ${auditFindings}
Ta valeur : ${valueProp}

Génère l'email avec l'objet et le corps.`;
}