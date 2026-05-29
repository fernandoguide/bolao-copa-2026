import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("teams")
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 5, unique: true })
  code: string;

  @Column({ length: 2, nullable: true })
  group: string;

  @Column({ nullable: true })
  flagUrl: string;
}
