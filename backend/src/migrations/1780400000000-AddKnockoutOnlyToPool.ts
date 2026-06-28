import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKnockoutOnlyToPool1780400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pools" ADD "knockoutOnly" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pools" DROP COLUMN "knockoutOnly"`);
  }
}
