import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPoolsAndAdminRole1780200000000 implements MigrationInterface {
  name = "AddPoolsAndAdminRole1780200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add role column to users
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" character varying(20) NOT NULL DEFAULT 'user'`
    );

    // Create pools table
    await queryRunner.query(`
      CREATE TABLE "pools" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "inviteCode" character varying(20) NOT NULL,
        "ownerId" uuid NOT NULL,
        "isPrivate" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_pools_inviteCode" UNIQUE ("inviteCode"),
        CONSTRAINT "PK_pools" PRIMARY KEY ("id")
      )
    `);

    // Create pool_members table
    await queryRunner.query(`
      CREATE TABLE "pool_members" (
        "id" SERIAL NOT NULL,
        "poolId" integer NOT NULL,
        "userId" uuid NOT NULL,
        "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_pool_members_pool_user" UNIQUE ("poolId", "userId"),
        CONSTRAINT "PK_pool_members" PRIMARY KEY ("id")
      )
    `);

    // Foreign keys
    await queryRunner.query(
      `ALTER TABLE "pools" ADD CONSTRAINT "FK_pools_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "pool_members" ADD CONSTRAINT "FK_pool_members_pool" FOREIGN KEY ("poolId") REFERENCES "pools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "pool_members" ADD CONSTRAINT "FK_pool_members_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pool_members" DROP CONSTRAINT "FK_pool_members_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "pool_members" DROP CONSTRAINT "FK_pool_members_pool"`
    );
    await queryRunner.query(
      `ALTER TABLE "pools" DROP CONSTRAINT "FK_pools_owner"`
    );
    await queryRunner.query(`DROP TABLE "pool_members"`);
    await queryRunner.query(`DROP TABLE "pools"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
  }
}
