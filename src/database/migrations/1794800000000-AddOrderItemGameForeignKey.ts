import {
  MigrationInterface,
  QueryRunner,
  TableForeignKey,
} from 'typeorm';

export class AddOrderItemGameForeignKey1794800000000
  implements MigrationInterface
{
  name = 'AddOrderItemGameForeignKey1794800000000';

  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        name: 'FK_order_items_game',
        columnNames: ['gameId'],
        referencedTableName: 'games',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'NO ACTION',
      }),
    );
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.dropForeignKey(
      'order_items',
      'FK_order_items_game',
    );
  }
}
