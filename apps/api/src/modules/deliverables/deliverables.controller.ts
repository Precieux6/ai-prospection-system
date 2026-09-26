import { Controller, Put, Param, Body } from "@nestjs/common";
import { DeliverablesService } from "./deliverables.service";

@Controller("api/deliverables")
export class DeliverablesController {
  constructor(private readonly service: DeliverablesService) {}

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: { content: string }) {
    return this.service.updateContent(id, "test-user-id", body.content);
  }
}