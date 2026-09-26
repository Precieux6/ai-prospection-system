import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Charger le .env
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), ".env"),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is missing in .env");

const genAI = new GoogleGenerativeAI(apiKey);

export const textModel = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL || "gemini-1.5-pro" 
});

export const embeddingModel = genAI.getGenerativeModel({ 
  model: process.env.EMBEDDING_MODEL || "text-embedding-004" 
});

export async function generateText(prompt: string, jsonMode = false): Promise<string> {
  const result = await textModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: jsonMode ? "application/json" : "text/plain",
      temperature: 0.5,
    },
  });
  return result.response.text();
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}