import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePasswordColumn1780100000000 implements MigrationInterface {
  name = "RemovePasswordColumn1780100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying NOT NULL DEFAULT ''`
    );
  }
}
