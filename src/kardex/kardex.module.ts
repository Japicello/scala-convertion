import { Module } from '@nestjs/common';
import { KardexController } from './kardex.controller';
import { KardexService } from './services/kardex.service';
import { KardexDiagnosticoService } from './services/kardex-diagnostico.service';
import { KardexPdfService } from './services/kardex-pdf.service';

@Module({
  controllers: [KardexController],
  providers: [
    KardexService,
    KardexDiagnosticoService,
    KardexPdfService,
  ],
  exports: [
    KardexService,
    KardexDiagnosticoService,
    KardexPdfService,
  ],
})
export class KardexModule {}
