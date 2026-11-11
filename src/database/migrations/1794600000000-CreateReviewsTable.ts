import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class CreateReviewsTable1794600000000
  implements MigrationInterface
{
  name = 'CreateReviewsTable1794600000000';
  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL
          DEFAULT gen_random_uuid(),

        "customer_id" uuid NOT NULL,

        "game_id" uuid NOT NULL,

        "rating" integer NOT NULL,

        "comment" text,

        "created_at" timestamptz NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        "updated_at" timestamptz NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "PK_reviews_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_reviews_customer_game"
          UNIQUE ("customer_id", "game_id"),

        CONSTRAINT "CHK_reviews_rating"
          CHECK ("rating" BETWEEN 1 AND 5),

        CONSTRAINT "CHK_reviews_comment_length"
          CHECK (
            "comment" IS NULL OR
            char_length("comment") <= 1000
          )
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_game_id"
      ON "reviews" ("game_id")
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "reviews"
    `);
  }
}
