import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('donations')
export class DonationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Anónimo' })
  supporterName: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 'PAYPAL' })
  platform: string;

  @Column({ nullable: true })
  transactionReference?: string;

  @Column({ nullable: true })
  note?: string;

  @Column({ default: 'CONFIRMED' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
