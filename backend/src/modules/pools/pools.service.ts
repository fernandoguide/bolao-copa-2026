import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Pool } from "./entities/pool.entity";
import { PoolMember } from "./entities/pool-member.entity";
import { CreatePoolDto } from "./dto/create-pool.dto";
import { randomBytes } from "crypto";

@Injectable()
export class PoolsService {
  constructor(
    @InjectRepository(Pool)
    private readonly poolsRepo: Repository<Pool>,
    @InjectRepository(PoolMember)
    private readonly membersRepo: Repository<PoolMember>
  ) {}

  async create(userId: string, dto: CreatePoolDto): Promise<Pool> {
    const inviteCode = randomBytes(5).toString("hex").toUpperCase();

    const pool = this.poolsRepo.create({
      name: dto.name,
      inviteCode,
      ownerId: userId,
      isPrivate: true,
      knockoutOnly: dto.knockoutOnly ?? false,
    });

    const saved = await this.poolsRepo.save(pool);

    // Owner automatically joins
    const member = this.membersRepo.create({
      poolId: saved.id,
      userId,
    });
    await this.membersRepo.save(member);

    return saved;
  }

  async joinByCode(userId: string, inviteCode: string): Promise<Pool> {
    const pool = await this.poolsRepo.findOne({
      where: { inviteCode },
    });

    if (!pool) {
      throw new NotFoundException("Código de convite inválido");
    }

    const existing = await this.membersRepo.findOne({
      where: { poolId: pool.id, userId },
    });

    if (existing) {
      throw new ConflictException("Você já participa deste bolão");
    }

    const member = this.membersRepo.create({
      poolId: pool.id,
      userId,
    });
    await this.membersRepo.save(member);

    return pool;
  }

  async findMyPools(userId: string): Promise<Pool[]> {
    const memberships = await this.membersRepo.find({
      where: { userId },
      relations: ["pool", "pool.owner"],
    });

    return memberships.map((m) => m.pool);
  }

  async findPoolWithMembers(poolId: number, userId: string): Promise<Pool> {
    const pool = await this.poolsRepo.findOne({
      where: { id: poolId },
      relations: ["members", "members.user", "owner"],
    });

    if (!pool) {
      throw new NotFoundException("Bolão não encontrado");
    }

    // Check if user is a member
    const isMember = pool.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException("Você não participa deste bolão");
    }

    return pool;
  }

  async leavePool(poolId: number, userId: string): Promise<void> {
    const pool = await this.poolsRepo.findOne({ where: { id: poolId } });
    if (!pool) throw new NotFoundException("Bolão não encontrado");

    if (pool.ownerId === userId) {
      throw new ForbiddenException(
        "O dono do bolão não pode sair. Delete o bolão."
      );
    }

    await this.membersRepo.delete({ poolId, userId });
  }

  async deletePool(poolId: number, userId: string): Promise<void> {
    const pool = await this.poolsRepo.findOne({ where: { id: poolId } });
    if (!pool) throw new NotFoundException("Bolão não encontrado");

    if (pool.ownerId !== userId) {
      throw new ForbiddenException("Apenas o dono pode deletar o bolão");
    }

    await this.poolsRepo.remove(pool);
  }
}
