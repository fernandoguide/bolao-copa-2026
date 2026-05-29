import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Match } from "../../matches/entities/match.entity";

@Entity("predictions")
@Unique(["user", "match"])
export class Prediction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.predictions)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  user_id: string;

  @ManyToOne(() => Match, (match) => match.predictions)
  @JoinColumn({ name: "match_id" })
  match: Match;

  @Column()
  match_id: number;

  @Column()
  homeScore: number;

  @Column()
  awayScore: number;

  @Column({ default: 0 })
  points: number;

  @CreateDateColumn()
  createdAt: Date;
}
