import { Test, TestingModule } from '@nestjs/testing';
import { KardexDiagnosticoService } from './kardex-diagnostico.service';
import { EvaluarDiagnosticoDto } from '../dto/evaluar-diagnostico.dto';

describe('KardexDiagnosticoService', () => {
  let service: KardexDiagnosticoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KardexDiagnosticoService],
    }).compile();

    service = module.get<KardexDiagnosticoService>(KardexDiagnosticoService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('evaluarSignosVitales', () => {
    it('debe detectar crisis hipertensiva crítica cuando TA >= 180/120', () => {
      const alertas = service.evaluarSignosVitales({
        tensionArterial: '190/125',
      });

      expect(alertas.length).toBeGreaterThan(0);
      const alertaTa = alertas.find((a) => a.parametro === 'Tensión Arterial');
      expect(alertaTa).toBeDefined();
      expect(alertaTa?.severidad).toBe('CRITICA');
      expect(alertaTa?.mensaje).toContain('Crisis hipertensiva');
    });

    it('debe detectar hipertermia severa cuando T >= 39.0 °C', () => {
      const alertas = service.evaluarSignosVitales({
        temperatura: 39.4,
      });

      const alertaTemp = alertas.find((a) => a.parametro === 'Temperatura Corporal');
      expect(alertaTemp).toBeDefined();
      expect(alertaTemp?.severidad).toBe('CRITICA');
      expect(alertaTemp?.mensaje).toContain('Hipertermia severa');
    });

    it('debe detectar dolor severo cuando EVA >= 7', () => {
      const alertas = service.evaluarSignosVitales({
        escalaDolor: 8,
      });

      const alertaDolor = alertas.find((a) => a.parametro === 'Dolor (Escala EVA)');
      expect(alertaDolor).toBeDefined();
      expect(alertaDolor?.severidad).toBe('CRITICA');
    });

    it('debe detectar hipoxemia crítica cuando SpO2 < 90%', () => {
      const alertas = service.evaluarSignosVitales({
        saturacionOxigeno: 88,
      });

      const alertaSat = alertas.find((a) => a.parametro === 'Saturación de Oxígeno (SpO2)');
      expect(alertaSat).toBeDefined();
      expect(alertaSat?.severidad).toBe('CRITICA');
    });
  });

  describe('generarDiagnosticosPae', () => {
    it('debe formular diagnóstico PES de Dolor Agudo [00132] si el paciente tiene dolor o es postoperatorio', () => {
      const params: EvaluarDiagnosticoDto = {
        edad: 38,
        sexo: 'F',
        diagnosticoMedico: 'Apendicectomía postoperatoria',
        signosVitales: {
          escalaDolor: 7,
          frecuenciaCardiaca: 96,
        },
        sintomasOProblemas: ['dolor agudo en herida quirúrgica'],
      };

      const diagnosticos = service.generarDiagnosticosPae(params);
      expect(diagnosticos.length).toBeGreaterThan(0);

      const dxDolor = diagnosticos.find((d) => d.codigoNanda === '00132');
      expect(dxDolor).toBeDefined();
      expect(dxDolor?.etiquetaDiagnostica).toBe('Dolor agudo');
      expect(dxDolor?.tipo).toBe('Real');
      expect(dxDolor?.prioridad).toBe('Alta');
      expect(dxDolor?.enunciadoDiagnostico).toContain('Dolor agudo r/c');
      expect(dxDolor?.enunciadoDiagnostico).toContain('m/p');
      expect(dxDolor?.objetivosNoc.length).toBeGreaterThan(0);
      expect(dxDolor?.intervencionesNic.length).toBeGreaterThan(0);
    });

    it('debe formular diagnóstico de Hipertermia [00007] si presenta fiebre', () => {
      const params: EvaluarDiagnosticoDto = {
        edad: 25,
        sexo: 'M',
        diagnosticoMedico: 'Neumonía adquirida en la comunidad',
        signosVitales: {
          temperatura: 38.6,
        },
      };

      const diagnosticos = service.generarDiagnosticosPae(params);
      const dxFiebre = diagnosticos.find((d) => d.codigoNanda === '00007');
      expect(dxFiebre).toBeDefined();
      expect(dxFiebre?.etiquetaDiagnostica).toBe('Hipertermia');
      expect(dxFiebre?.enunciadoDiagnostico).toContain('38.6°C');
    });

    it('debe formular Riesgo de deterioro de la integridad cutánea [00047] en pacientes encamados', () => {
      const params: EvaluarDiagnosticoDto = {
        edad: 78,
        sexo: 'M',
        diagnosticoMedico: 'ACV isquémico con hemiplejía',
        antecedentesOCondiciones: ['reposo absoluto en cama prolongado', 'encamado'],
      };

      const diagnosticos = service.generarDiagnosticosPae(params);
      const dxPiel = diagnosticos.find((d) => d.codigoNanda === '00047');
      expect(dxPiel).toBeDefined();
      expect(dxPiel?.tipo).toBe('Riesgo');
      expect(dxPiel?.enunciadoDiagnostico).toContain('Riesgo de deterioro de la integridad cutánea r/c');
    });
  });

  describe('generarNotaSoapie', () => {
    it('debe generar una nota SOAPIE completa con las 6 secciones estándar', () => {
      const diagnosticos = service.generarDiagnosticosPae({
        edad: 40,
        sexo: 'F',
        diagnosticoMedico: 'Colecistitis aguda',
        signosVitales: { escalaDolor: 6, temperatura: 37.0, tensionArterial: '120/80' },
        sintomasOProblemas: ['dolor en hipocondrio derecho'],
      });

      const soapie = service.generarNotaSoapie({
        paciente: { edad: 40, sexo: 'F' },
        diagnosticos,
        signosVitales: { escalaDolor: 6, temperatura: 37.0, tensionArterial: '120/80' },
        sintomas: ['dolor en hipocondrio derecho'],
      });

      expect(soapie).toBeDefined();
      expect(soapie.subjetivo).toContain('dolor en hipocondrio derecho');
      expect(soapie.objetivo).toContain('TA: 120/80 mmHg');
      expect(soapie.analisis).toContain('Dolor agudo');
      expect(soapie.planificacion).toBeDefined();
      expect(soapie.intervencion).toBeDefined();
      expect(soapie.evaluacion).toBeDefined();
    });
  });
});
