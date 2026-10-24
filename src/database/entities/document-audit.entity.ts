import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum DocumentModuleType {
  KARDEX = 'KARDEX',
  CONVERTER = 'CONVERTER',
  SCANNER = 'SCANNER',
  SIGNATURE = 'SIGNATURE',
  OFFICE = 'OFFICE',
}

@Entity('documents_audit')
export class DocumentAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column({ default: 'application/pdf' })
  mimeType: string;

  @Column({ type: 'int', default: 0 })
  sizeBytes: number;

  @Column()
  sha256Hash: string;

  @Column({
    type: 'simple-enum',
    enum: DocumentModuleType,
    default: DocumentModuleType.CONVERTER,
  })
  moduleType: DocumentModuleType;

  @Column({ default: 'PROCESSED' })
  status: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  clientIp?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
