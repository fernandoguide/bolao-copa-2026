import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("teams")
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async findAll() {
    return this.teamsService.findAll();
  }

  @Get("group/:group")
  async findByGroup(@Param("group") group: string) {
    return this.teamsService.findByGroup(group.toUpperCase());
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return this.teamsService.findById(id);
  }
}
