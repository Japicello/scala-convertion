import { KardexInventoryService } from './kardex-inventory.service';
import { KardexValuationMethod } from '../database/entities/kardex-record.entity';

describe('KardexInventoryService', () => {
  let service: KardexInventoryService;
  let mockKardexRepo: any;
  let mockAuditRepo: any;

  beforeEach(() => {
    mockKardexRepo = {
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'uuid-1', ...d })),
      find: jest.fn().mockResolvedValue([]),
    };
    mockAuditRepo = {
      save: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    };
    service = new KardexInventoryService(mockKardexRepo, mockAuditRepo);
  });

  it('calculates average valuation (Promedio Ponderado) correctly', () => {
    const result = service.calcularKardex({
      empresa: 'Corporación Scala S.A.C.',
      ruc: '20608849121',
      periodo: 'Q1 - 2026',
      moneda: 'USD',
      metodoValuacion: KardexValuationMethod.PROMEDIO,
      sku: 'PROD-SKU-9921',
      descripcionItem: 'Válvula de Presión 2" Hidráulica',
      movimientos: [
        { fecha: '02/01/2026', documento: 'INV-INI', tipo: 'INICIAL', cantidad: 100, costoUnitario: 96.0 },
        { fecha: '15/01/2026', documento: 'F001-8842', tipo: 'ENTRADA', cantidad: 150, costoUnitario: 98.0 },
        { fecha: '28/01/2026', documento: 'GR-002-194', tipo: 'SALIDA', cantidad: 180, costoUnitario: 0 },
      ],
    });

    expect(result.totalEntradasUnidades).toBe(250);
    expect(result.totalSalidasUnidades).toBe(180);
    expect(result.saldoFinalUnidades).toBe(70);
    expect(result.digitalSignHash).toBeDefined();
    expect(result.digitalSignHash.length).toBe(64);
  });

  it('calculates FIFO / PEPS valuation correctly', () => {
    const result = service.calcularKardex({
      empresa: 'Corporación Scala S.A.C.',
      ruc: '20608849121',
      periodo: 'Q1 - 2026',
      moneda: 'USD',
      metodoValuacion: KardexValuationMethod.PEPS,
      sku: 'PROD-SKU-9921',
      descripcionItem: 'Válvula de Presión 2" Hidráulica',
      movimientos: [
        { fecha: '02/01/2026', documento: 'INV-INI', tipo: 'INICIAL', cantidad: 100, costoUnitario: 90.0 },
        { fecha: '15/01/2026', documento: 'F001-8842', tipo: 'ENTRADA', cantidad: 100, costoUnitario: 100.0 },
        { fecha: '28/01/2026', documento: 'GR-002-194', tipo: 'SALIDA', cantidad: 120, costoUnitario: 0 },
      ],
    });

    // 100 @ 90 + 20 @ 100 used = 9000 + 2000 = 11000 saída
    // Remaining: 80 @ 100 = 8000
    expect(result.saldoFinalUnidades).toBe(80);
    expect(result.saldoFinalValor).toBe(8000);
  });
});
