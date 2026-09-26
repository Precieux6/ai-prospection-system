import { Controller, Post, Headers, Body } from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";

@Controller("api/webhooks")
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Post("clerk")
  async handleClerk(@Headers() headers: Record<string, string>, @Body() body: any) {
    await this.service.handleClerkWebhook(headers, body);
    return { ok: true };
  }
}