import { getDocument } from "pdfjs-dist";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const loadingTask = getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      useSystemFonts: false,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .filter((str: string) => str.trim())
        .join(" ");
      
      fullText += pageText + "\n\n";
    }

    const cleanText = fullText.replace(/\s+/g, " ").trim();
    
    if (!cleanText) {
      throw new Error("Le PDF ne contient pas de texte extractible");
    }

    return cleanText;
  } catch (error: any) {
    console.error("Erreur détaillée extraction PDF:", error.message);
    throw new Error(`Impossible d'extraire le texte du PDF: ${error.message}`);
  }
}