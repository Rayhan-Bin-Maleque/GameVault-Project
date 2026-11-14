
import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class CreateSupportTables1794700000000
  implements MigrationInterface
{
  name = 'CreateSupportTables1794700000000';

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {

    

    await queryRunner.query(`
      CREATE TYPE "public"."support_tickets_category_enum"
      AS ENUM(
        'ACCOUNT',
        'PAYMENT',
        'ORDER',
        'GAME',
        'TECHNICAL',
        'REFUND',
        'OTHER'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."support_tickets_priority_enum"
      AS ENUM(
        'LOW',
        'MEDIUM',
        'HIGH',
        'URGENT'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."support_tickets_status_enum"
      AS ENUM(
        'OPEN',
        'ASSIGNED',
        'IN_PROGRESS',
        'WAITING_FOR_CUSTOMER',
        'RESOLVED',
        'CLOSED'
      )
    `);



    await queryRunner.query(`
      CREATE TABLE "support_tickets" (

        "id" uuid NOT NULL
          DEFAULT gen_random_uuid(),

        "ticketNumber" character varying(30)
          NOT NULL,

        "subject" character varying(200)
          NOT NULL,

        "description" text
          NOT NULL,

        "category" "public"."support_tickets_category_enum"
          NOT NULL,

        "priority" "public"."support_tickets_priority_enum"
          NOT NULL DEFAULT 'MEDIUM',

        "status" "public"."support_tickets_status_enum"
          NOT NULL DEFAULT 'OPEN',

        "customerId" uuid
          NOT NULL,

        "assignedToId" uuid,

        "createdAt" TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        "updatedAt" TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        "resolvedAt" TIMESTAMP,

        "reopenRequestedAt" TIMESTAMP,

        CONSTRAINT "PK_support_tickets_id"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_support_tickets_ticketNumber"
          UNIQUE ("ticketNumber")
      )
    `);


    await queryRunner.query(`
      ALTER TABLE "support_tickets"
      ADD CONSTRAINT "FK_support_tickets_customer"
      FOREIGN KEY ("customerId")
      REFERENCES "users"("id")
      ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "support_tickets"
      ADD CONSTRAINT "FK_support_tickets_assignedTo"
      FOREIGN KEY ("assignedToId")
      REFERENCES "users"("id")
      ON DELETE SET NULL
    `);

 

    await queryRunner.query(`
      CREATE INDEX "IDX_support_tickets_customerId"
      ON "support_tickets" ("customerId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_support_tickets_assignedToId"
      ON "support_tickets" ("assignedToId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_support_tickets_status"
      ON "support_tickets" ("status")
    `);

   

    await queryRunner.query(`
      CREATE TABLE "support_messages" (

        "id" uuid NOT NULL
          DEFAULT gen_random_uuid(),

        "ticketId" uuid
          NOT NULL,

        "senderId" uuid
          NOT NULL,

        "message" text
          NOT NULL,

        "createdAt" TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        "updatedAt" TIMESTAMP
          NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "PK_support_messages_id"
          PRIMARY KEY ("id")
      )
    `);

    

    await queryRunner.query(`
      ALTER TABLE "support_messages"
      ADD CONSTRAINT "FK_support_messages_ticket"
      FOREIGN KEY ("ticketId")
      REFERENCES "support_tickets"("id")
      ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "support_messages"
      ADD CONSTRAINT "FK_support_messages_sender"
      FOREIGN KEY ("senderId")
      REFERENCES "users"("id")
      ON DELETE RESTRICT
    `);

    

    await queryRunner.query(`
      CREATE INDEX "IDX_support_messages_ticketId"
      ON "support_messages" ("ticketId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_support_messages_senderId"
      ON "support_messages" ("senderId")
    `);
  }

 

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {

    await queryRunner.query(`
      DROP TABLE IF EXISTS "support_messages"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "support_tickets"
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS
      "public"."support_tickets_status_enum"
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS
      "public"."support_tickets_priority_enum"
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS
      "public"."support_tickets_category_enum"
    `);
  }
}
