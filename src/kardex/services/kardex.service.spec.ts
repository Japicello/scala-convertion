import { Test, TestingModule } from '@nestjs/testing';
import { KardexService } from './kardex.service';
import { KardexDiagnosticoService } from './kardex-diagnostico.service';
import { KardexPdfService } from './kardex-pdf.service';
import { CrearKardexDto } from '../dto/crear-kardex.dto';

describe('KardexService', () => {
  let service: KardexService;
  let diagnosticoService: KardexDiagnosticoService;
  let pdfService: KardexPdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KardexService,
        KardexDiagnosticoService,
        KardexPdfService,
      ],
    }).compile();

    service = module.get<KardexService>(KardexService);
    diagnosticoService = module.get<KardexDiagnosticoService>(KardexDiagnosticoService);
    pdfService = module.get<KardexPdfService>(KardexPdfService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
    expect(diagnosticoService).toBeDefined();
    expect(pdfService).toBeDefined();
  });

  describe('evaluarDiagnostico', () => {
    it('debe evaluar parámetros y retornar diagnóstico, alertas y normativa de Venezuela', () => {
      const res = service.evaluarDiagnostico({
        edad: 30,
        sexo: 'M',
        diagnosticoMedico: 'Apendicitis aguda',
        signosVitales: {
          temperatura: 38.5,
          escalaDolor: 8,
          tensionArterial: '130/80',
        },
        sintomasOProblemas: ['dolor fosa ilíaca derecha', 'fiebre'],
      });

      expect(res.paciente.diagnosticoMedico).toBe('Apendicitis aguda');
      expect(res.diagnosticosEnfermeria.length).toBeGreaterThan(0);
      expect(res.alertasClinicas.length).toBeGreaterThan(0);
      expect(res.notaSOGuardiaSugerida).toBeDefined();
      expect(res.normativaAplicada).toContain('República Bolivariana de Venezuela');
    });
  });

  describe('procesarFichaKardex', () => {
    it('debe inferir diagnósticos automáticamente si la app no los envía', () => {
      const dto: CrearKardexDto = {
        institucion: 'Hospital Domingo Luciani',
        servicio: 'Cirugía',
        cama: 'Cama 04',
        paciente: {
          nombres: 'Carlos',
          apellidos: 'Pérez',
          historiaClinica: 'HC-1002',
          edad: 42,
          sexo: 'M',
          fechaIngreso: '2026-10-24',
          diagnosticoMedicoPrincipal: 'Apendicectomía abierta',
          alergias: ['Ninguna'],
          tipoDieta: 'Líquida',
          condicionMovilidad: 'Reposo relativo',
        },
        signosVitales: {
          escalaDolor: 6,
          temperatura: 37.0,
        },
        medicamentos: [
          {
            medicamento: 'Ketoprofeno',
            dosis: '100 mg',
            via: 'EV',
            frecuencia: 'c/8h',
            horarios: ['06:00', '14:00', '22:00'],
          },
        ],
      };

      const ficha = service.procesarFichaKardex(dto);

      expect(ficha.id).toBeDefined();
      expect(ficha.diagnosticosEnfermeria.length).toBeGreaterThan(0);
      expect(ficha.medicamentos[0].distribucionTurnos).toBeDefined();
      expect(ficha.notaSOGuardia).toBeDefined();
      expect(ficha.notaSOGuardia?.analisis).toBeDefined();
    });
  });

  describe('exportarPdf', () => {
    it('debe generar el PDF y un nombre de archivo seguro con el número de historia clínica', async () => {
      const dto: CrearKardexDto = {
        institucion: 'Hospital Central de Maracay',
        servicio: 'Traumatología',
        cama: 'Cama 8',
        paciente: {
          nombres: 'Ana',
          apellidos: 'Torres',
          historiaClinica: 'HC-7744',
          edad: 61,
          sexo: 'F',
          fechaIngreso: '2026-10-23',
          diagnosticoMedicoPrincipal: 'Fractura cerrada de fémur',
          alergias: ['Dipirona'],
          tipoDieta: 'Blanda',
          condicionMovilidad: 'Reposo absoluto',
        },
        signosVitales: {
          escalaDolor: 8,
          temperatura: 37.2,
          frecuenciaCardiaca: 88,
        },
      };

      const { buffer, filename } = await service.exportarPdf(dto);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);
      expect(filename).toContain('HC-7744');
      expect(filename.endsWith('.pdf')).toBe(true);
    });
  });

  describe('obtenerCatalogos', () => {
    it('debe devolver catálogo con dietas venezolanas, turnos y diagnósticos frecuentes', () => {
      const catalogos = service.obtenerCatalogos();
      expect(catalogos.formato.pais).toBe('República Bolivariana de Venezuela');
      expect(catalogos.turnos.Mañana).toBeDefined();
      expect(catalogos.dietasHospitalarias.length).toBeGreaterThan(5);
      expect(catalogos.diagnosticosPaeFrecuentes.length).toBeGreaterThan(0);
    });
  });
});
