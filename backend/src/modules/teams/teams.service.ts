import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Team } from "./entities/team.entity";

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamsRepo.find({ order: { group: "ASC", name: "ASC" } });
  }

  async findByGroup(group: string): Promise<Team[]> {
    return this.teamsRepo.find({ where: { group }, order: { name: "ASC" } });
  }

  async findById(id: number): Promise<Team | null> {
    return this.teamsRepo.findOne({ where: { id } });
  }
}
