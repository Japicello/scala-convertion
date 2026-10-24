import { Test, TestingModule } from '@nestjs/testing';
import { KardexPdfService } from './kardex-pdf.service';
import { IFichaKardexCompleta } from '../interfaces/kardex.interface';

describe('KardexPdfService', () => {
  let service: KardexPdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KardexPdfService],
    }).compile();

    service = module.get<KardexPdfService>(KardexPdfService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe generar un buffer PDF válido con cabecera %PDF-', async () => {
    const mockKardex: IFichaKardexCompleta = {
      id: 'KDX-12345',
      fechaRegistro: '2026-10-24',
      institucion: 'Hospital Universitario de Caracas',
      ministerioSalud: 'República Bolivariana de Venezuela - MPPS',
      servicio: 'Medicina Interna',
      cama: 'Cama 12',
      paciente: {
        nombres: 'José Gregorio',
        apellidos: 'Hernández',
        cedulaIdentidad: 'V-14.567.890',
        historiaClinica: 'HC-9921',
        edad: 58,
        unidadEdad: 'años',
        sexo: 'M',
        fechaIngreso: '2026-10-22',
        diagnosticoMedicoPrincipal: 'Crisis Hipertensiva tratada',
        alergias: ['Penicilina'],
        tipoDieta: 'Hiposódica estricta',
        condicionMovilidad: 'Reposo relativo',
      },
      signosVitales: {
        tensionArterial: '135/85',
        frecuenciaCardiaca: 76,
        frecuenciaRespiratoria: 18,
        temperatura: 36.8,
        saturacionOxigeno: 98,
        escalaDolor: 2,
      },
      medicamentos: [
        {
          medicamento: 'Enalapril',
          presentacion: 'Tabletas 10 mg',
          dosis: '10 mg',
          via: 'VO',
          frecuencia: 'c/12h',
          horarios: ['08:00', '20:00'],
          distribucionTurnos: { manana: true, tarde: false, noche: true },
        },
      ],
      diagnosticosEnfermeria: [
        {
          codigoNanda: '00132',
          etiquetaDiagnostica: 'Dolor agudo',
          dominio: 'Dominio 12',
          clase: 'Clase 1',
          tipo: 'Real',
          prioridad: 'Media',
          factoresRelacionados: ['Cefalea tensional'],
          caracteristicasDefinitorias: ['EVA 2/10'],
          enunciadoDiagnostico: 'Dolor agudo r/c cefalea tensional m/p EVA 2/10',
          objetivosNoc: [{ resultadoEsperado: 'Alivio del dolor' }],
          intervencionesNic: [{ intervencion: 'Manejo del dolor', acciones: ['Vigilancia de signos vitales'] }],
        },
      ],
      notaSOGuardia: {
        subjetivo: 'Paciente asintomático.',
        objetivo: 'TA controlada.',
        analisis: 'Evolución favorable.',
        planificacion: 'Continuar tratamiento.',
        intervencion: 'Administración de tratamiento.',
        evaluacion: 'Paciente tranquilo.',
      },
      responsable: {
        nombre: 'Lcda. Carmen Mendoza',
        cargo: 'Licenciada en Enfermería',
        matriculaMpps: 'MPPS-84930',
        turno: 'Mañana',
      },
    };

    const pdfBuffer = await service.generarPdfKardex(mockKardex);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);

    // Verificar firma mágica de PDF (%PDF-)
    const header = pdfBuffer.slice(0, 5).toString('ascii');
    expect(header).toBe('%PDF-');
  });
});
