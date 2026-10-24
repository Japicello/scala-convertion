import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonationEntity } from '../database/entities/donation.entity';
import { DonationIntentDto } from './dto/donation-intent.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(DonationEntity)
    private readonly donationRepo: Repository<DonationEntity>,
  ) {}

  getConfig() {
    return {
      title: 'Apoyar el Desarrollo de ScalaDocs',
      description:
        'ScalaDocs es un motor libre y gratuito de conversión documental y kardex. Tus donaciones financian el mantenimiento de los servidores OCR y almacenamiento seguro.',
      goal: {
        targetMonthlyUsd: 150,
        currentMonthlyUsd: 102,
        percentage: 68,
      },
      tiers: [
        {
          id: 'coffee',
          name: 'Invítanos un Café',
          amountUsd: 2,
          perk: 'Mención de agradecimiento en el panel de colaboradores',
          icon: '☕',
        },
        {
          id: 'server',
          name: 'Mantenimiento del Servidor',
          amountUsd: 5,
          perk: 'Prioridad de ancho de banda en procesamiento OCR',
          icon: '🚀',
        },
        {
          id: 'patron',
          name: 'Patrocinador Pro',
          amountUsd: 10,
          perk: 'Insignia de Patrocinador en la app y soporte preferencial',
          icon: '💎',
        },
      ],
      channels: {
        paypal: 'https://paypal.me/scaladocs',
        kofi: 'https://ko-fi.com/scaladocs',
        crypto: {
          usdtTron: 'TJv7fXk9A1y98vhmFpCFjD48TPKzkqr9Rw',
          bitcoin: 'bc1q9a77fbc881023ef3a78810b22849f001',
        },
      },
    };
  }

  async registerIntent(dto: DonationIntentDto) {
    const donation = this.donationRepo.create({
      supporterName: dto.supporterName || 'Anónimo',
      amount: dto.amount,
      currency: dto.currency,
      platform: dto.platform,
      note: dto.note,
      status: 'INTENT_CREATED',
    });

    const saved = await this.donationRepo.save(donation);

    return {
      message: '¡Gracias por apoyar a ScalaDocs!',
      donationId: saved.id,
      paymentUrl:
        dto.platform === 'KOFI'
          ? 'https://ko-fi.com/scaladocs'
          : 'https://paypal.me/scaladocs',
    };
  }
}
