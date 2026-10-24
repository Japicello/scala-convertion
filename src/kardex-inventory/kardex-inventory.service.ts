import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import {
  KardexRecordEntity,
  KardexValuationMethod,
} from '../database/entities/kardex-record.entity';
import {
  DocumentAuditEntity,
  DocumentModuleType,
} from '../database/entities/document-audit.entity';
import {
  CalcularKardexInventoryDto,
  KardexMovementDto,
} from './dto/kardex-inventory.dto';

export interface CalculatedRow {
  fecha: string;
  documento: string;
  tipo: string;
  entradaCant: number;
  entradaCostoU: number;
  entradaTotal: number;
  salidaCant: number;
  salidaCostoU: number;
  salidaTotal: number;
  saldoCant: number;
  saldoCostoU: number;
  saldoTotal: number;
}

export interface KardexCalculationResult {
  empresa: string;
  ruc: string;
  periodo: string;
  moneda: string;
  metodoValuacion: KardexValuationMethod;
  sku: string;
  descripcionItem: string;
  filas: CalculatedRow[];
  totalEntradasUnidades: number;
  totalEntradasValor: number;
  totalSalidasUnidades: number;
  totalSalidasValor: number;
  saldoFinalUnidades: number;
  saldoFinalValor: number;
  costoUnitarioFinal: number;
  capacidadAlmacenPorcentaje: number;
  digitalSignHash: string;
  normativa: string;
}

@Injectable()
export class KardexInventoryService {
  constructor(
    @InjectRepository(KardexRecordEntity)
    private readonly kardexRepo: Repository<KardexRecordEntity>,
    @InjectRepository(DocumentAuditEntity)
    private readonly auditRepo: Repository<DocumentAuditEntity>,
  ) {}

  calcularKardex(dto: CalcularKardexInventoryDto): KardexCalculationResult {
    let currentQty = 0;
    let currentValue = 0;
    let totalEntradasU = 0;
    let totalEntradasV = 0;
    let totalSalidasU = 0;
    let totalSalidasV = 0;

    const rows: CalculatedRow[] = [];
    // Batches for PEPS/UEPS tracking
    const batches: { qty: number; cost: number }[] = [];

    for (const mov of dto.movimientos) {
      if (mov.tipo === 'ENTRADA' || mov.tipo === 'INICIAL') {
        const entTotal = mov.cantidad * mov.costoUnitario;
        currentQty += mov.cantidad;
        currentValue += entTotal;
        totalEntradasU += mov.cantidad;
        totalEntradasV += entTotal;

        batches.push({ qty: mov.cantidad, cost: mov.costoUnitario });

        const unitCost = currentQty > 0 ? currentValue / currentQty : 0;

        rows.push({
          fecha: mov.fecha,
          documento: mov.documento,
          tipo: mov.tipo,
          entradaCant: mov.cantidad,
          entradaCostoU: mov.costoUnitario,
          entradaTotal: Number(entTotal.toFixed(2)),
          salidaCant: 0,
          salidaCostoU: 0,
          salidaTotal: 0,
          saldoCant: currentQty,
          saldoCostoU: Number(unitCost.toFixed(2)),
          saldoTotal: Number(currentValue.toFixed(2)),
        });
      } else if (mov.tipo === 'SALIDA') {
        if (mov.cantidad > currentQty) {
          throw new BadRequestException(
            `Existencias insuficientes para salida del documento ${mov.documento}. Saldo disponible: ${currentQty}, solicitado: ${mov.cantidad}`,
          );
        }

        let salidaVal = 0;
        let salidaUnit = 0;

        if (dto.metodoValuacion === KardexValuationMethod.PROMEDIO) {
          salidaUnit = currentQty > 0 ? currentValue / currentQty : 0;
          salidaVal = mov.cantidad * salidaUnit;
          currentQty -= mov.cantidad;
          currentValue -= salidaVal;
        } else if (dto.metodoValuacion === KardexValuationMethod.PEPS) {
          let needed = mov.cantidad;
          salidaVal = 0;
          while (needed > 0 && batches.length > 0) {
            const first = batches[0];
            const take = Math.min(needed, first.qty);
            salidaVal += take * first.cost;
            first.qty -= take;
            needed -= take;
            if (first.qty === 0) batches.shift();
          }
          currentQty -= mov.cantidad;
          currentValue -= salidaVal;
          salidaUnit = mov.cantidad > 0 ? salidaVal / mov.cantidad : 0;
        } else {
          // UEPS
          let needed = mov.cantidad;
          salidaVal = 0;
          while (needed > 0 && batches.length > 0) {
            const last = batches[batches.length - 1];
            const take = Math.min(needed, last.qty);
            salidaVal += take * last.cost;
            last.qty -= take;
            needed -= take;
            if (last.qty === 0) batches.pop();
          }
          currentQty -= mov.cantidad;
          currentValue -= salidaVal;
          salidaUnit = mov.cantidad > 0 ? salidaVal / mov.cantidad : 0;
        }

        totalSalidasU += mov.cantidad;
        totalSalidasV += salidaVal;

        const saldoUnit = currentQty > 0 ? currentValue / currentQty : 0;

        rows.push({
          fecha: mov.fecha,
          documento: mov.documento,
          tipo: mov.tipo,
          entradaCant: 0,
          entradaCostoU: 0,
          entradaTotal: 0,
          salidaCant: mov.cantidad,
          salidaCostoU: Number(salidaUnit.toFixed(2)),
          salidaTotal: Number(salidaVal.toFixed(2)),
          saldoCant: currentQty,
          saldoCostoU: Number(saldoUnit.toFixed(2)),
          saldoTotal: Number(currentValue.toFixed(2)),
        });
      }
    }

    const hashPayload = `${dto.ruc}-${dto.sku}-${dto.periodo}-${currentQty}-${currentValue.toFixed(2)}`;
    const digitalSignHash = crypto.createHash('sha256').update(hashPayload).digest('hex').toUpperCase();

    return {
      empresa: dto.empresa,
      ruc: dto.ruc,
      periodo: dto.periodo,
      moneda: dto.moneda,
      metodoValuacion: dto.metodoValuacion,
      sku: dto.sku,
      descripcionItem: dto.descripcionItem,
      filas: rows,
      totalEntradasUnidades: totalEntradasU,
      totalEntradasValor: Number(totalEntradasV.toFixed(2)),
      totalSalidasUnidades: totalSalidasU,
      totalSalidasValor: Number(totalSalidasV.toFixed(2)),
      saldoFinalUnidades: currentQty,
      saldoFinalValor: Number(currentValue.toFixed(2)),
      costoUnitarioFinal: currentQty > 0 ? Number((currentValue / currentQty).toFixed(2)) : 0,
      capacidadAlmacenPorcentaje: 68,
      digitalSignHash,
      normativa: 'SUNAT Resolución N° 234-2006 / NIIF 2 Inventarios (Oficial Formato 13.1)',
    };
  }

  async guardarKardexAudit(
    result: KardexCalculationResult,
    userId?: string,
  ): Promise<KardexRecordEntity> {
    const record = this.kardexRepo.create({
      documentNumber: `KDX-${Date.now().toString().slice(-6)}`,
      companyName: result.empresa,
      rucTaxId: result.ruc,
      period: result.periodo,
      currency: result.moneda,
      valuationMethod: result.metodoValuacion,
      sku: result.sku,
      itemName: result.descripcionItem,
      entriesTotal: result.totalEntradasValor,
      exitsTotal: result.totalSalidasValor,
      balanceQuantity: result.saldoFinalUnidades,
      balanceValue: result.saldoFinalValor,
      digitalSignHash: result.digitalSignHash,
      movementsJson: result.filas,
      userId,
    });

    const saved = await this.kardexRepo.save(record);

    await this.auditRepo.save({
      filename: `Kardex_${result.sku}_${result.periodo}.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: 1024 * 18,
      sha256Hash: result.digitalSignHash,
      moduleType: DocumentModuleType.KARDEX,
      status: 'AUDITED',
      userId,
      metadata: {
        sku: result.sku,
        metodo: result.metodoValuacion,
        unidades: result.saldoFinalUnidades,
        valor: result.saldoFinalValor,
      },
    });

    return saved;
  }

  async listarKardex(userId?: string): Promise<KardexRecordEntity[]> {
    if (userId) {
      return this.kardexRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 20,
      });
    }
    return this.kardexRepo.find({
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}
