import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Team } from "../../teams/entities/team.entity";
import { Prediction } from "../../predictions/entities/prediction.entity";

export enum MatchStage {
  GROUP = "group",
  ROUND_OF_32 = "round_of_32",
  ROUND_OF_16 = "round_of_16",
  QUARTER_FINAL = "quarter_final",
  SEMI_FINAL = "semi_final",
  THIRD_PLACE = "third_place",
  FINAL = "final",
}

@Entity("matches")
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Team, { eager: true, nullable: true })
  @JoinColumn({ name: "home_team_id" })
  homeTeam: Team | null;

  @ManyToOne(() => Team, { eager: true, nullable: true })
  @JoinColumn({ name: "away_team_id" })
  awayTeam: Team | null;

  @Column({ type: "timestamp" })
  matchDate: Date;

  @Column({ type: "enum", enum: MatchStage, default: MatchStage.GROUP })
  stage: MatchStage;

  @Column({ nullable: true })
  homeScore: number;

  @Column({ nullable: true })
  awayScore: number;

  @Column({ default: false })
  played: boolean;

  @Column({ nullable: true, length: 50 })
  matchLabel: string;

  @OneToMany(() => Prediction, (prediction) => prediction.match)
  predictions: Prediction[];
}
