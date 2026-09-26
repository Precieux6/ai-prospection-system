import { QdrantClient } from "@qdrant/js-client-rest";
import { generateEmbedding } from "./gemini";
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

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "user_profile_chunks";
const VECTOR_SIZE = 768;

export async function ensureCollection() {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);
  
  if (!exists) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: { size: VECTOR_SIZE, distance: "Cosine" },
    });
    console.log(`✅ Collection Qdrant '${COLLECTION_NAME}' créée.`);
  }
}

export async function ingestUserProfile(userId: string, profileText: string) {
  await qdrant.delete(COLLECTION_NAME, {
    filter: { must: [{ key: "user_id", match: { value: userId } }] },
  });

  const chunks = profileText.split("\n\n").filter((chunk) => chunk.trim().length > 20);

  const points = await Promise.all(
    chunks.map(async (chunk, index) => {
      const vector = await generateEmbedding(chunk);
      return {
        id: `${userId}_${index}`,
        vector,
        payload: {
          user_id: userId,
          chunk_type: "experience",
          chunk_text: chunk,
        },
      };
    })
  );

  await qdrant.upsert(COLLECTION_NAME, { wait: true, points });
  console.log(`✅ ${points.length} chunks ingérés pour l'utilisateur ${userId}`);
}

export async function retrieveRelevantChunks(
  userId: string, 
  query: string, 
  limit = 4
): Promise<string[]> {
  const queryVector = await generateEmbedding(query);
  
  const results = await qdrant.query(COLLECTION_NAME, {
    query: queryVector,
    filter: { must: [{ key: "user_id", match: { value: userId } }] },
    limit,
    with_payload: true,
  });

  return results.points.map((r: any) => r.payload?.chunk_text as string);
}