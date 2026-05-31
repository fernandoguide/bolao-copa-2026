import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

const VALID_GROUPS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

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
    const upperGroup = group.toUpperCase();
    if (!VALID_GROUPS.includes(upperGroup)) {
      throw new BadRequestException(
        `Grupo inválido. Valores permitidos: ${VALID_GROUPS.join(", ")}`
      );
    }
    return this.teamsService.findByGroup(upperGroup);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.teamsService.findById(id);
  }
}
