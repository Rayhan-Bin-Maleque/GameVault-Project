import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGamesAndGamesCategories1794335853965 implements MigrationInterface {
    name = 'CreateGamesAndGamesCategories1794335853965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "games" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(150) NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "imageUrl" character varying(500), "releaseDate" date NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "publisherId" uuid NOT NULL, CONSTRAINT "UQ_06734e8b047d4cd535598fcde0e" UNIQUE ("title"), CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_categories" ("game_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_bdc48d9af826b477937a2675f1c" PRIMARY KEY ("game_id", "category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_674dc07479ee0fb150689d7b5e" ON "game_categories"  ("game_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9d561ef48697736212f5b7bc43" ON "game_categories"  ("category_id") `);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_ac1293076b49d61bb4a47d8b485" FOREIGN KEY ("publisherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_categories" ADD CONSTRAINT "FK_674dc07479ee0fb150689d7b5ef" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "game_categories" ADD CONSTRAINT "FK_9d561ef48697736212f5b7bc435" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_categories" DROP CONSTRAINT "FK_9d561ef48697736212f5b7bc435"`);
        await queryRunner.query(`ALTER TABLE "game_categories" DROP CONSTRAINT "FK_674dc07479ee0fb150689d7b5ef"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_ac1293076b49d61bb4a47d8b485"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9d561ef48697736212f5b7bc43"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_674dc07479ee0fb150689d7b5e"`);
        await queryRunner.query(`DROP TABLE "game_categories"`);
        await queryRunner.query(`DROP TABLE "games"`);
    }

}
