import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversionsModule } from './conversions/conversions.module';
import { KardexModule } from './kardex/kardex.module';
import { AuthModule } from './auth/auth.module';
import { KardexInventoryModule } from './kardex-inventory/kardex-inventory.module';
import { DocumentsModule } from './documents/documents.module';
import { DonationsModule } from './donations/donations.module';
import { UserEntity } from './database/entities/user.entity';
import { DocumentAuditEntity } from './database/entities/document-audit.entity';
import { KardexRecordEntity } from './database/entities/kardex-record.entity';
import { DonationEntity } from './database/entities/donation.entity';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

@Module({
  imports: [
    // Rate Limiting: 60 requests per minute
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      },
    ]),
    // SQLite Database via TypeORM & sql.js (robust, portable, zero-setup)
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: path.join(process.cwd(), 'data', 'scala.db'),
      autoSave: true,
      entities: [
        UserEntity,
        DocumentAuditEntity,
        KardexRecordEntity,
        DonationEntity,
      ],
      synchronize: true,
    }),
    AuthModule,
    ConversionsModule,
    KardexModule,
    KardexInventoryModule,
    DocumentsModule,
    DonationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
