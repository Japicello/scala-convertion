import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationEntity } from '../database/entities/donation.entity';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DonationEntity])],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
