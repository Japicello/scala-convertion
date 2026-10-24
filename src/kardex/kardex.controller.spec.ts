import { Test, TestingModule } from '@nestjs/testing';
import { KardexController } from './kardex.controller';
import { KardexService } from './services/kardex.service';
import { KardexDiagnosticoService } from './services/kardex-diagnostico.service';
import { KardexPdfService } from './services/kardex-pdf.service';
import { EvaluarDiagnosticoDto } from './dto/evaluar-diagnostico.dto';
import { CrearKardexDto } from './dto/crear-kardex.dto';
import { StreamableFile } from '@nestjs/common';

describe('KardexController', () => {
  let controller: KardexController;
  let service: KardexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KardexController],
      providers: [
        KardexService,
        KardexDiagnosticoService,
        KardexPdfService,
      ],
    }).compile();

    controller = module.get<KardexController>(KardexController);
    service = module.get<KardexService>(KardexService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe evaluar diagnostico llamando al servicio', () => {
    const dto: EvaluarDiagnosticoDto = {
      edad: 40,
      sexo: 'F',
      diagnosticoMedico: 'Colecistitis',
      signosVitales: { escalaDolor: 5 },
    };

    const spy = jest.spyOn(service, 'evaluarDiagnostico');
    const result = controller.evaluarDiagnostico(dto);

    expect(spy).toHaveBeenCalledWith(dto);
    expect(result.diagnosticosEnfermeria).toBeDefined();
  });

  it('debe crear ficha kardex llamando al servicio', () => {
    const dto: CrearKardexDto = {
      institucion: 'Hospital Universitario de Caracas',
      servicio: 'Medicina',
      cama: 'Cama 01',
      paciente: {
        nombres: 'Elena',
        apellidos: 'Blanco',
        historiaClinica: 'HC-1122',
        edad: 50,
        sexo: 'F',
        fechaIngreso: '2026-10-24',
        diagnosticoMedicoPrincipal: 'Neumonía',
        alergias: ['Ninguna'],
        tipoDieta: 'Completa',
        condicionMovilidad: 'Deambulación libre',
      },
      signosVitales: { temperatura: 38.0 },
    };

    const spy = jest.spyOn(service, 'procesarFichaKardex');
    const result = controller.crearFichaKardex(dto);

    expect(spy).toHaveBeenCalledWith(dto);
    expect(result.institucion).toBe('Hospital Universitario de Caracas');
  });

  it('debe exportar kardex pdf y retornar un StreamableFile', async () => {
    const dto: CrearKardexDto = {
      institucion: 'Hospital Universitario de Caracas',
      servicio: 'Medicina',
      cama: 'Cama 01',
      paciente: {
        nombres: 'Elena',
        apellidos: 'Blanco',
        historiaClinica: 'HC-1122',
        edad: 50,
        sexo: 'F',
        fechaIngreso: '2026-10-24',
        diagnosticoMedicoPrincipal: 'Neumonía',
        alergias: ['Ninguna'],
        tipoDieta: 'Completa',
        condicionMovilidad: 'Deambulación libre',
      },
      signosVitales: { temperatura: 38.0 },
    };

    const result = await controller.exportarKardexPdf(dto);
    expect(result).toBeInstanceOf(StreamableFile);
  });

  it('debe retornar los catálogos de enfermería venezolanos', () => {
    const catalogos = controller.obtenerCatalogos();
    expect(catalogos).toBeDefined();
    expect(catalogos.formato.pais).toBe('República Bolivariana de Venezuela');
  });
});
