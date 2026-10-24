import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KardexRecordEntity } from '../database/entities/kardex-record.entity';
import { DocumentAuditEntity } from '../database/entities/document-audit.entity';
import { KardexInventoryService } from './kardex-inventory.service';
import { KardexInventoryPdfService } from './kardex-inventory-pdf.service';
import { KardexInventoryController } from './kardex-inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KardexRecordEntity, DocumentAuditEntity])],
  controllers: [KardexInventoryController],
  providers: [KardexInventoryService, KardexInventoryPdfService],
  exports: [KardexInventoryService, KardexInventoryPdfService],
})
export class KardexInventoryModule {}
