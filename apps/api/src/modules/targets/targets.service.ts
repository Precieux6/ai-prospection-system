import { Injectable } from "@nestjs/common";
import { db, targets, deliverables } from "@repo/db";
import { eq, and, desc } from "drizzle-orm";

@Injectable()
export class TargetsService {
  
  async getPendingReview(userId: string, type?: string) {
    const conds = [
      eq(targets.userId, userId),
      eq(targets.status, "pending_review")
    ];
    
    // ✅ CORRECTION : Caster 'type' en tant que valeur d'enum valide
    if (type && (type === "job" || type === "prospect")) {
      conds.push(eq(targets.type, type as "job" | "prospect"));
    }
    
    return db.select()
      .from(targets)
      .where(and(...conds))
      .orderBy(desc(targets.aiMatchScore))
      .limit(20);
  }

  async getTargetById(targetId: string, userId: string) {
    const [target] = await db.select()
      .from(targets)
      .where(and(eq(targets.id, targetId), eq(targets.userId, userId)));
    return target;
  }

  async getTargetDeliverables(targetId: string) {
    return db.select()
      .from(deliverables)
      .where(eq(deliverables.targetId, targetId));
  }

  async approveTarget(targetId: string, userId: string) {
    return db.update(targets)
      .set({ status: "approved", updatedAt: new Date() })
      .where(and(eq(targets.id, targetId), eq(targets.userId, userId)))
      .returning();
  }

  async rejectTarget(targetId: string, userId: string) {
    return db.update(targets)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(and(eq(targets.id, targetId), eq(targets.userId, userId)))
      .returning();
  }
}