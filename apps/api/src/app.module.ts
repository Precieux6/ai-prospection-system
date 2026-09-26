import { Module } from "@nestjs/common";
import { UsersModule } from "./modules/users/users.module";
import { TargetsModule } from "./modules/targets/targets.module";
import { DeliverablesModule } from "./modules/deliverables/deliverables.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";

@Module({
  imports: [
    UsersModule,
    TargetsModule,
    DeliverablesModule,
    WebhooksModule,
  ],
})
export class AppModule {}