import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { PoolMember } from "./pool-member.entity";

@Entity("pools")
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, unique: true })
  inviteCode: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "ownerId" })
  owner: User;

  @Column()
  ownerId: string;

  @Column({ default: true })
  isPrivate: boolean;

  @OneToMany(() => PoolMember, (member) => member.pool)
  members: PoolMember[];

  @CreateDateColumn()
  createdAt: Date;
}
