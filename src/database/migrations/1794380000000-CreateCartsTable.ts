
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartsTable1794380000000
  implements MigrationInterface
{
  name = 'CreateCartsTable1794380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customerId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_carts_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_carts_customer_id"
          UNIQUE ("customerId"),

        CONSTRAINT "FK_carts_customer_users"
          FOREIGN KEY ("customerId")
          REFERENCES "users"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "carts"
    `);
  }
}
