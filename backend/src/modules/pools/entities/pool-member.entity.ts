import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { Pool } from "./pool.entity";
import { User } from "../../users/entities/user.entity";

@Entity("pool_members")
@Unique(["poolId", "userId"])
export class PoolMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pool, (pool) => pool.members, { onDelete: "CASCADE" })
  @JoinColumn({ name: "poolId" })
  pool: Pool;

  @Column()
  poolId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  joinedAt: Date;
}
