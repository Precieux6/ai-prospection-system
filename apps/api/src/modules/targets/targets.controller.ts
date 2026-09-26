import { Controller, Get, Post, Param, Query } from "@nestjs/common";
import { TargetsService } from "./targets.service";

@Controller("api/targets")
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  @Get("review")
  async getPendingReview(@Query("type") type?: string) {
    // TODO: Récupérer le userId réel
    return this.targetsService.getPendingReview("test-user-id", type);
  }

  @Get(":id")
  async getTarget(@Param("id") id: string) {
    const target = await this.targetsService.getTargetById(id, "test-user-id");
    const deliverables = await this.targetsService.getTargetDeliverables(id);
    return { target, deliverables };
  }

  @Post(":id/approve")
  async approve(@Param("id") id: string) {
    return this.targetsService.approveTarget(id, "test-user-id");
  }

  @Post(":id/reject")
  async reject(@Param("id") id: string) {
    return this.targetsService.rejectTarget(id, "test-user-id");
  }
}