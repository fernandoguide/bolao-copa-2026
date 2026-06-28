import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPenaltyFields1780300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "matches" ADD "homePenalty" integer`);
    await queryRunner.query(`ALTER TABLE "matches" ADD "awayPenalty" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "awayPenalty"`);
    await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "homePenalty"`);
  }
}
