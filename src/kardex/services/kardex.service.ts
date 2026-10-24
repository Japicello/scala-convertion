import { Injectable, Logger } from '@nestjs/common';
import { KardexDiagnosticoService } from './kardex-diagnostico.service';
import { KardexPdfService } from './kardex-pdf.service';
import { EvaluarDiagnosticoDto } from '../dto/evaluar-diagnostico.dto';
import { CrearKardexDto } from '../dto/crear-kardex.dto';
import {
  CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA,
  CONDICIONES_MOVILIDAD_ESTANDAR,
  DIETAS_ESTANDAR_VENEZUELA,
  FORMATO_VENEZUELA_DEFAULT,
  TURNOS_HOSPITALARIOS_VENEZUELA,
  VIAS_ADMINISTRACION_ESTANDAR,
} from '../constants/kardex-catalogo.constants';
import {
  IFichaKardexCompleta,
  IMedicamentoKardex,
  INotaSoapie,
  IDiagnosticoEnfermeriaKardex,
} from '../interfaces/kardex.interface';

export interface IResultadoEvaluacionDiagnostica {
  paciente: {
    edad: number;
    sexo: string;
    diagnosticoMedico: string;
  };
  signosVitales?: any;
  alertasClinicas: any[];
  diagnosticosEnfermeria: IDiagnosticoEnfermeriaKardex[];
  notaSOGuardiaSugerida?: INotaSoapie;
  resumenClinico: string;
  normativaAplicada: string;
}

@Injectable()
export class KardexService {
  private readonly logger = new Logger(KardexService.name);

  constructor(
    private readonly diagnosticoService: KardexDiagnosticoService,
    private readonly pdfService: KardexPdfService,
  ) {}

  /**
   * Procesa los parámetros clínicos enviados por la app para emitir el diagnóstico de enfermería
   * según el formato estándar venezolano PAE (PES: Problema, Etiología, Signos/Síntomas).
   */
  evaluarDiagnostico(dto: EvaluarDiagnosticoDto): IResultadoEvaluacionDiagnostica {
    this.logger.log(`Evaluando parámetros de enfermería para paciente con dx: ${dto.diagnosticoMedico}`);

    const alertas = this.diagnosticoService.evaluarSignosVitales(dto.signosVitales);
    const diagnosticos = this.diagnosticoService.generarDiagnosticosPae(dto);

    let soapieSugerido: INotaSoapie | undefined;
    if (dto.generarBorradorSoapie !== false) {
      soapieSugerido = this.diagnosticoService.generarNotaSoapie({
        paciente: { edad: dto.edad, sexo: dto.sexo, diagnosticoMedico: dto.diagnosticoMedico },
        diagnosticos,
        signosVitales: dto.signosVitales,
        alertas,
        sintomas: dto.sintomasOProblemas,
      });
    }

    const diagnosticoLider = diagnosticos[0];
    const resumen = diagnosticoLider
      ? `Diagnóstico de enfermería prioritario: ${diagnosticoLider.enunciadoDiagnostico} (Prioridad ${diagnosticoLider.prioridad}). Se identificaron ${alertas.length} alertas clínicas.`
      : 'Evaluación completada sin hallazgos de alta prioridad.';

    return {
      paciente: {
        edad: dto.edad,
        sexo: dto.sexo,
        diagnosticoMedico: dto.diagnosticoMedico,
      },
      signosVitales: dto.signosVitales,
      alertasClinicas: alertas,
      diagnosticosEnfermeria: diagnosticos,
      notaSOGuardiaSugerida: soapieSugerido,
      resumenClinico: resumen,
      normativaAplicada: `${FORMATO_VENEZUELA_DEFAULT.pais} - ${FORMATO_VENEZUELA_DEFAULT.ministerio} (Taxonomía NANDA-NOC-NIC)`,
    };
  }

  /**
   * Recibe el objeto completo de Kárdex desde la app móvil, normaliza los turnos hospitalarios,
   * audita las alertas y estructura la ficha completa del estándar de Venezuela.
   */
  procesarFichaKardex(dto: CrearKardexDto): IFichaKardexCompleta {
    this.logger.log(`Procesando ficha de Kárdex para cama ${dto.cama} - HCL: ${dto.paciente.historiaClinica}`);

    // 1. Evaluar alertas de signos vitales
    const alertas = this.diagnosticoService.evaluarSignosVitales(dto.signosVitales);

    // 2. Diagnósticos de enfermería: si la app no envió ninguno, inferirlos automáticamente
    let diagnosticos: IDiagnosticoEnfermeriaKardex[] = [];
    if (!dto.diagnosticosEnfermeria || dto.diagnosticosEnfermeria.length === 0) {
      diagnosticos = this.diagnosticoService.generarDiagnosticosPae({
        edad: dto.paciente.edad,
        sexo: dto.paciente.sexo,
        diagnosticoMedico: dto.paciente.diagnosticoMedicoPrincipal,
        signosVitales: dto.signosVitales,
        sintomasOProblemas: dto.cuidadosEspeciales,
        antecedentesOCondiciones: dto.paciente.diagnosticosMedicosSecundarios,
        dispositivosPresentes: dto.dispositivosInvasivos?.map((d) => `${d.tipo} ${d.descripcion}`),
      });
    } else {
      // Normalizar y asegurar formulación PES en los diagnósticos provistos por la app
      diagnosticos = dto.diagnosticosEnfermeria.map((diag) => {
        const enunciado =
          diag.enunciadoDiagnostico ||
          this.diagnosticoService.formularEnunciadoPes({
            etiquetaDiagnostica: diag.etiquetaDiagnostica,
            factoresRelacionados: diag.factoresRelacionados,
            caracteristicasDefinitorias: diag.caracteristicasDefinitorias,
            tipo: diag.tipo,
          });

        return {
          codigoNanda: diag.codigoNanda,
          etiquetaDiagnostica: diag.etiquetaDiagnostica,
          dominio: diag.dominio || 'N/A',
          clase: diag.clase || 'N/A',
          tipo: diag.tipo,
          prioridad: diag.prioridad,
          factoresRelacionados: diag.factoresRelacionados || [],
          caracteristicasDefinitorias: diag.caracteristicasDefinitorias || [],
          enunciadoDiagnostico: enunciado,
          objetivosNoc: (diag.objetivosNoc || []).map((o) => ({
            codigo: o.codigo,
            resultadoEsperado: o.resultadoEsperado,
            indicador: o.indicador,
            escalaMeta: o.escalaMeta,
          })),
          intervencionesNic: (diag.intervencionesNic || []).map((i) => ({
            codigo: i.codigo,
            intervencion: i.intervencion,
            acciones: i.acciones || [],
            turno: i.turno || 'Todos',
          })),
          estadoEvaluacion: diag.estadoEvaluacion || 'En proceso',
        };
      });
    }

    // 3. Normalizar distribución de medicamentos en turnos venezolanos
    const medicamentosNormalizados: IMedicamentoKardex[] = (dto.medicamentos || []).map((med) => {
      let distribucion = med.distribucionTurnos;

      // Si la app envió horarios específicos pero no la bandera de turnos, calcular automáticamente
      if (!distribucion && med.horarios && med.horarios.length > 0) {
        distribucion = this.calcularDistribucionTurnosPorHorarios(med.horarios);
      } else if (!distribucion) {
        distribucion = { manana: true, tarde: true, noche: true };
      }

      return {
        medicamento: med.medicamento,
        presentacion: med.presentacion,
        dosis: med.dosis,
        via: med.via,
        frecuencia: med.frecuencia,
        horarios: med.horarios,
        distribucionTurnos: distribucion,
        observaciones: med.observaciones,
        fechaInicio: med.fechaInicio || new Date().toISOString().slice(0, 10),
      };
    });

    // 4. Nota SOAPIE: si no la proveyó la app, estructurar un borrador profesional
    let notaSoapie: INotaSoapie = dto.notaSOGuardia as INotaSoapie;
    if (!notaSoapie || !notaSoapie.subjetivo) {
      notaSoapie = this.diagnosticoService.generarNotaSoapie({
        paciente: dto.paciente,
        diagnosticos,
        signosVitales: dto.signosVitales,
        alertas,
        sintomas: dto.cuidadosEspeciales,
      });
    }

    const fichaKardex: IFichaKardexCompleta = {
      id: `KDX-${Date.now()}`,
      fechaRegistro: new Date().toISOString().slice(0, 10),
      institucion: dto.institucion,
      ministerioSalud: dto.ministerioSalud || `${FORMATO_VENEZUELA_DEFAULT.pais} - ${FORMATO_VENEZUELA_DEFAULT.ministerio}`,
      servicio: dto.servicio,
      cama: dto.cama,
      sala: dto.sala,
      paciente: {
        nombres: dto.paciente.nombres,
        apellidos: dto.paciente.apellidos,
        cedulaIdentidad: dto.paciente.cedulaIdentidad,
        historiaClinica: dto.paciente.historiaClinica,
        edad: dto.paciente.edad,
        unidadEdad: dto.paciente.unidadEdad || 'años',
        sexo: dto.paciente.sexo,
        fechaIngreso: dto.paciente.fechaIngreso,
        diasHospitalizacion: dto.paciente.diasHospitalizacion,
        diagnosticoMedicoPrincipal: dto.paciente.diagnosticoMedicoPrincipal,
        diagnosticosMedicosSecundarios: dto.paciente.diagnosticosMedicosSecundarios,
        alergias: dto.paciente.alergias || ['Ninguna conocida'],
        tipoDieta: dto.paciente.tipoDieta,
        condicionMovilidad: dto.paciente.condicionMovilidad,
      },
      signosVitales: dto.signosVitales,
      alertasClinicas: alertas,
      balanceHidrico: dto.balanceHidrico,
      dispositivosInvasivos: dto.dispositivosInvasivos as any,
      diagnosticosEnfermeria: diagnosticos,
      medicamentos: medicamentosNormalizados,
      cuidadosEspeciales: dto.cuidadosEspeciales || [],
      laboratoriosPendientes: dto.laboratoriosPendientes || [],
      estudiosPendientes: dto.estudiosPendientes || [],
      interconsultasPendientes: dto.interconsultasPendientes || [],
      pendientesRelevo: dto.pendientesRelevo || [],
      notaSOGuardia: notaSoapie,
      responsable: dto.responsable,
    };

    return fichaKardex;
  }

  /**
   * Genera el PDF oficial del Kárdex de enfermería de Venezuela listo para descargar o imprimir
   */
  async exportarPdf(dto: CrearKardexDto): Promise<{ buffer: Buffer; filename: string }> {
    const fichaConsolidada = this.procesarFichaKardex(dto);
    const pdfBuffer = await this.pdfService.generarPdfKardex(fichaConsolidada);

    const safeHcl = (fichaConsolidada.paciente.historiaClinica || 'sin-hc')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toUpperCase();
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `Kardex-Enfermeria-HCL_${safeHcl}-${fecha}.pdf`;

    return {
      buffer: pdfBuffer,
      filename,
    };
  }

  /**
   * Retorna catálogos hospitalarios de Venezuela para poblar selectores en la aplicación móvil
   */
  obtenerCatalogos() {
    return {
      formato: FORMATO_VENEZUELA_DEFAULT,
      turnos: TURNOS_HOSPITALARIOS_VENEZUELA,
      dietasHospitalarias: DIETAS_ESTANDAR_VENEZUELA,
      viasAdministracion: VIAS_ADMINISTRACION_ESTANDAR,
      condicionesMovilidad: CONDICIONES_MOVILIDAD_ESTANDAR,
      diagnosticosPaeFrecuentes: CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA.map((d) => ({
        codigoNanda: d.codigoNanda,
        etiquetaDiagnostica: d.etiquetaDiagnostica,
        dominio: d.dominio,
        clase: d.clase,
        tipo: d.tipo,
        factoresRelacionadosComunes: d.factoresRelacionadosComunes,
        caracteristicasDefinitoriasComunes: d.caracteristicasDefinitoriasComunes,
      })),
    };
  }

  /**
   * Calcula la distribución por turnos hospitalarios en Venezuela a partir de los horarios dados
   */
  private calcularDistribucionTurnosPorHorarios(horarios: string[]): {
    manana: boolean;
    tarde: boolean;
    noche: boolean;
  } {
    let manana = false;
    let tarde = false;
    let noche = false;

    for (const h of horarios) {
      const match = h.match(/(\d{1,2})/);
      if (match) {
        const hora = parseInt(match[1], 10);
        if (TURNOS_HOSPITALARIOS_VENEZUELA.Mañana.horas.includes(hora)) {
          manana = true;
        } else if (TURNOS_HOSPITALARIOS_VENEZUELA.Tarde.horas.includes(hora)) {
          tarde = true;
        } else if (TURNOS_HOSPITALARIOS_VENEZUELA.Noche.horas.includes(hora)) {
          noche = true;
        }
      }
    }

    return { manana, tarde, noche };
  }
}
