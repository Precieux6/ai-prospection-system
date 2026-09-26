import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { Webhook } from "svix";

@Injectable()
export class WebhooksService {
  constructor(private readonly usersService: UsersService) {}

  async handleClerkWebhook(headers: Record<string, string>, body: any) {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    
    // ✅ Correction : caster le retour de verify() en any pour accéder aux propriétés
    const evt: any = wh.verify(JSON.stringify(body), headers as any);

    if (evt.type === "user.created") {
      await this.usersService.create({
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0]?.email_address,
        fullName: `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim(),
        baseProfileText: "Profil à compléter",
      });
    }
  }
}