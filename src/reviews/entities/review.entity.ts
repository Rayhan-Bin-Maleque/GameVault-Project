import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
  Check,
} from 'typeorm';

@Entity('reviews')
@Unique('UQ_reviews_customer_game', [
  'customerId',
  'gameId',
])
@Index('IDX_reviews_game_id', ['gameId'])
@Check(
  'CHK_reviews_rating',
  '"rating" BETWEEN 1 AND 5',
)
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'customer_id',
    type: 'uuid',
  })
  customerId!: string;

  @Column({
    name: 'game_id',
    type: 'uuid',
  })
  gameId!: string;

  @Column({
    type: 'int',
  })
  rating!: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  comment!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
