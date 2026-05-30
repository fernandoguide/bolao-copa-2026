import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pool } from "./entities/pool.entity";
import { PoolMember } from "./entities/pool-member.entity";
import { PoolsService } from "./pools.service";
import { PoolsController } from "./pools.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Pool, PoolMember])],
  controllers: [PoolsController],
  providers: [PoolsService],
  exports: [PoolsService],
})
export class PoolsModule {}
