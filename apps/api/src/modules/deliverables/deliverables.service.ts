import { Injectable } from "@nestjs/common";
import { db, deliverables } from "@repo/db";
import { eq, and } from "drizzle-orm";

@Injectable()
export class DeliverablesService {
  async updateContent(deliverableId: string, userId: string, content: string) {
    return db.update(deliverables).set({ content, isHumanEdited: true, updatedAt: new Date() }).where(and(eq(deliverables.id, deliverableId), eq(deliverables.userId, userId))).returning();
  }
}