import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum KardexValuationMethod {
  PROMEDIO = 'PROMEDIO',
  PEPS = 'PEPS',
  UEPS = 'UEPS',
}

@Entity('kardex_records')
export class KardexRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  documentNumber?: string;

  @Column()
  companyName: string;

  @Column()
  rucTaxId: string;

  @Column()
  period: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    type: 'simple-enum',
    enum: KardexValuationMethod,
    default: KardexValuationMethod.PROMEDIO,
  })
  valuationMethod: KardexValuationMethod;

  @Column()
  sku: string;

  @Column()
  itemName: string;

  @Column({ type: 'float', default: 0 })
  entriesTotal: number;

  @Column({ type: 'float', default: 0 })
  exitsTotal: number;

  @Column({ type: 'float', default: 0 })
  balanceQuantity: number;

  @Column({ type: 'float', default: 0 })
  balanceValue: number;

  @Column({ nullable: true })
  digitalSignHash?: string;

  @Column({ type: 'simple-json', nullable: true })
  movementsJson?: Record<string, any>[];

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
