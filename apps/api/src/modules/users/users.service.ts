import { Injectable } from "@nestjs/common";
import { db, users, userSettings } from "@repo/db";
import { eq } from "drizzle-orm";
import { ingestUserProfile } from "@repo/ai";

@Injectable()
export class UsersService {
  
  async findByClerkId(clerkId: string) {
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    return user;
  }

  async create(data: { clerkId: string; email: string; fullName: string; baseProfileText: string }) {
    const [user] = await db.insert(users).values({
      clerkId: data.clerkId,
      email: data.email,
      fullName: data.fullName,
      baseProfileText: data.baseProfileText,
    }).returning();

    if (user) {
      await db.insert(userSettings).values({ userId: user.id });
      await ingestUserProfile(user.id, data.baseProfileText);
    }

    return user;
  }

  async getSettings(userId: string) {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async updateSettings(userId: string, data: any) {
    const [updated] = await db.update(userSettings).set({ 
      ...data, 
      updatedAt: new Date() 
    }).where(eq(userSettings.userId, userId)).returning();
    
    return updated;
  }

  async updateProfile(userId: string, profileText: string) {
    await db.update(users)
      .set({ baseProfileText: profileText, updatedAt: new Date() })
      .where(eq(users.id, userId));
    
    await ingestUserProfile(userId, profileText);
    return { success: true };
  }
}