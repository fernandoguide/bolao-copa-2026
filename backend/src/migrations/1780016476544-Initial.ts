import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1780016476544 implements MigrationInterface {
    name = 'Initial1780016476544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "teams" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "code" character varying(5) NOT NULL, "group" character varying(2), "flagUrl" character varying, CONSTRAINT "UQ_7bf0cfd599b5e34fa917a78d28f" UNIQUE ("code"), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."matches_stage_enum" AS ENUM('group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final')`);
        await queryRunner.query(`CREATE TABLE "matches" ("id" SERIAL NOT NULL, "matchDate" TIMESTAMP NOT NULL, "stage" "public"."matches_stage_enum" NOT NULL DEFAULT 'group', "homeScore" integer, "awayScore" integer, "played" boolean NOT NULL DEFAULT false, "matchLabel" character varying(50), "home_team_id" integer, "away_team_id" integer, CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "predictions" ("id" SERIAL NOT NULL, "user_id" uuid NOT NULL, "match_id" integer NOT NULL, "homeScore" integer NOT NULL, "awayScore" integer NOT NULL, "points" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_aaac60696c99e9f901efa9ffc10" UNIQUE ("user_id", "match_id"), CONSTRAINT "PK_b92c9e4db595214b289f5e28adc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_bb25f11ea6fa78b344a68923769" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_e457f057d971e464c1ebf6378c5" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD CONSTRAINT "FK_8e4b27973471685734e213da971" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD CONSTRAINT "FK_bf038b973af03c3568dffd9df69" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "predictions" DROP CONSTRAINT "FK_bf038b973af03c3568dffd9df69"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP CONSTRAINT "FK_8e4b27973471685734e213da971"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_e457f057d971e464c1ebf6378c5"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_bb25f11ea6fa78b344a68923769"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "predictions"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP TYPE "public"."matches_stage_enum"`);
        await queryRunner.query(`DROP TABLE "teams"`);
    }

}
