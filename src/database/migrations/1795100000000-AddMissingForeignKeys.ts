
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingForeignKeys1795100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_cart_items_game'
          AND conrelid = 'cart_items'::regclass
        ) THEN
          ALTER TABLE cart_items
          ADD CONSTRAINT "FK_cart_items_game"
          FOREIGN KEY ("gameId")
          REFERENCES games(id);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_reviews_game'
          AND conrelid = 'reviews'::regclass
        ) THEN
          ALTER TABLE reviews
          ADD CONSTRAINT "FK_reviews_game"
          FOREIGN KEY (game_id)
          REFERENCES games(id);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_reviews_customer'
          AND conrelid = 'reviews'::regclass
        ) THEN
          ALTER TABLE reviews
          ADD CONSTRAINT "FK_reviews_customer"
          FOREIGN KEY (customer_id)
          REFERENCES users(id);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE reviews
      DROP CONSTRAINT IF EXISTS "FK_reviews_customer";
    `);

    await queryRunner.query(`
      ALTER TABLE reviews
      DROP CONSTRAINT IF EXISTS "FK_reviews_game";
    `);

    await queryRunner.query(`
      ALTER TABLE cart_items
      DROP CONSTRAINT IF EXISTS "FK_cart_items_game";
    `);
  }
}
