import { Injectable, Logger } from '@nestjs/common';
import { CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA } from '../constants/kardex-catalogo.constants';
import { EvaluarDiagnosticoDto } from '../dto/evaluar-diagnostico.dto';
import {
  IAlertaClinica,
  IDiagnosticoEnfermeriaKardex,
  INotaSoapie,
  ISignosVitales,
  PrioridadDiagnostico,
} from '../interfaces/kardex.interface';

@Injectable()
export class KardexDiagnosticoService {
  private readonly logger = new Logger(KardexDiagnosticoService.name);

  /**
   * Evalúa los signos vitales y emite alertas clínicas categorizadas según estándares hospitalarios
   */
  evaluarSignosVitales(signos?: ISignosVitales): IAlertaClinica[] {
    if (!signos) return [];
    const alertas: IAlertaClinica[] = [];

    // 1. Tensión Arterial
    if (signos.tensionArterial) {
      const match = signos.tensionArterial.match(/(\d{2,3})\s*[/|-]\s*(\d{2,3})/);
      if (match) {
        const sistolica = parseInt(match[1], 10);
        const diastolica = parseInt(match[2], 10);

        if (sistolica >= 180 || diastolica >= 120) {
          alertas.push({
            parametro: 'Tensión Arterial',
            valor: signos.tensionArterial,
            severidad: 'CRITICA',
            mensaje: 'Crisis hipertensiva de riesgo (TA >= 180/120 mmHg).',
            recomendacion: 'Avisar de inmediato al médico de guardia y mantener reposo absoluto en posición Semifowler.',
          });
        } else if (sistolica >= 140 || diastolica >= 90) {
          alertas.push({
            parametro: 'Tensión Arterial',
            valor: signos.tensionArterial,
            severidad: 'ADVERTENCIA',
            mensaje: 'Cifras tensionales elevadas (Hipertensión arterial).',
            recomendacion: 'Verificar esquema antihipertensivo prescrito y reevaluar en 30 minutos.',
          });
        } else if (sistolica < 90 || diastolica < 60) {
          alertas.push({
            parametro: 'Tensión Arterial',
            valor: signos.tensionArterial,
            severidad: 'ADVERTENCIA',
            mensaje: 'Hipotensión arterial (TA < 90/60 mmHg).',
            recomendacion: 'Evaluar signos de hipovolemia, perfusión periférica y permeabilidad de vía EV.',
          });
        }
      }
    }

    // 2. Frecuencia Cardíaca
    if (signos.frecuenciaCardiaca !== undefined) {
      if (signos.frecuenciaCardiaca > 120) {
        alertas.push({
          parametro: 'Frecuencia Cardíaca',
          valor: `${signos.frecuenciaCardiaca} lpm`,
          severidad: 'CRITICA',
          mensaje: 'Taquicardia severa (> 120 lpm).',
          recomendacion: 'Evaluar dolor, fiebre, hipovolemia o arritmias. Realizar EKG de ser necesario.',
        });
      } else if (signos.frecuenciaCardiaca > 100) {
        alertas.push({
          parametro: 'Frecuencia Cardíaca',
          valor: `${signos.frecuenciaCardiaca} lpm`,
          severidad: 'ADVERTENCIA',
          mensaje: 'Taquicardia moderada (101-120 lpm).',
          recomendacion: 'Monitorizar pulso y descartar hipertermia o ansiedad.',
        });
      } else if (signos.frecuenciaCardiaca < 50) {
        alertas.push({
          parametro: 'Frecuencia Cardíaca',
          valor: `${signos.frecuenciaCardiaca} lpm`,
          severidad: 'CRITICA',
          mensaje: 'Bradicardia severa (< 50 lpm).',
          recomendacion: 'Verificar estabilidad hemodinámica y notificar al médico tratante.',
        });
      } else if (signos.frecuenciaCardiaca < 60) {
        alertas.push({
          parametro: 'Frecuencia Cardíaca',
          valor: `${signos.frecuenciaCardiaca} lpm`,
          severidad: 'ADVERTENCIA',
          mensaje: 'Bradicardia leve (50-59 lpm).',
          recomendacion: 'Vigilar presencia de mareos o hipotensión concomitante.',
        });
      }
    }

    // 3. Frecuencia Respiratoria
    if (signos.frecuenciaRespiratoria !== undefined) {
      if (signos.frecuenciaRespiratoria > 26) {
        alertas.push({
          parametro: 'Frecuencia Respiratoria',
          valor: `${signos.frecuenciaRespiratoria} rpm`,
          severidad: 'CRITICA',
          mensaje: 'Taquipnea severa (> 26 rpm) con posible dificultad respiratoria.',
          recomendacion: 'Colocar al paciente en posición Fowler alta y verificar permeabilidad de vía aérea.',
        });
      } else if (signos.frecuenciaRespiratoria > 22) {
        alertas.push({
          parametro: 'Frecuencia Respiratoria',
          valor: `${signos.frecuenciaRespiratoria} rpm`,
          severidad: 'ADVERTENCIA',
          mensaje: 'Taquipnea (23-26 rpm).',
          recomendacion: 'Monitorear oximetría y patrón ventilatorio.',
        });
      } else if (signos.frecuenciaRespiratoria < 12) {
        alertas.push({
          parametro: 'Frecuencia Respiratoria',
          valor: `${signos.frecuenciaRespiratoria} rpm`,
          severidad: 'CRITICA',
          mensaje: 'Bradipnea (< 12 rpm) - Riesgo de depresión respiratoria.',
          recomendacion: 'Verificar uso de sedantes u opioides; estimular ventilación.',
        });
      }
    }

    // 4. Temperatura Corporal
    if (signos.temperatura !== undefined) {
      if (signos.temperatura >= 39.0) {
        alertas.push({
          parametro: 'Temperatura Corporal',
          valor: `${signos.temperatura} °C`,
          severidad: 'CRITICA',
          mensaje: 'Hipertermia severa / Fiebre alta (>= 39.0 °C).',
          recomendacion: 'Aplicar medios físicos de inmediato, administrar antipirético prescrito y vigilar hidratación.',
        });
      } else if (signos.temperatura >= 37.8) {
        alertas.push({
          parametro: 'Temperatura Corporal',
          valor: `${signos.temperatura} °C`,
          severidad: 'ADVERTENCIA',
          mensaje: 'Febrícula o fiebre moderada (>= 37.8 °C).',
          recomendacion: 'Controlar curva térmica cada 2 horas y optimizar ventilación de la unidad.',
        });
      } else if (signos.temperatura < 35.5) {
        alertas.push({
          parametro: 'Temperatura Corporal',
          valor: `${signos.temperatura} °C`,
          severidad: 'ADVERTENCIA',
          mensaje: 'Hipotermia (< 35.5 °C).',
          recomendacion: 'Proveer abrigo térmico y evitar exposición a corrientes frías.',
        });
      }
    }

    // 5. Saturación de Oxígeno
    if (signos.saturacionOxigeno !== undefined) {
      if (signos.saturacionOxigeno < 90) {
        alertas.push({
          parametro: 'Saturación de Oxígeno (SpO2)',
          valor: `${signos.saturacionOxigeno} %`,
          severidad: 'CRITICA',
          mensaje: 'Hipoxemia severa (SpO2 < 90%).',
          recomendacion: 'Iniciar oxigenoterapia de urgencia según protocolo y auscultar campos pulmonares.',
        });
      } else if (signos.saturacionOxigeno < 94) {
        alertas.push({
          parametro: 'Saturación de Oxígeno (SpO2)',
          valor: `${signos.saturacionOxigeno} %`,
          severidad: 'ADVERTENCIA',
          mensaje: 'Hipoxemia moderada (SpO2 90-93%).',
          recomendacion: 'Verificar posición del paciente y necesidad de soporte de O2 suplementario.',
        });
      }
    }

    // 6. Escala del Dolor (EVA)
    if (signos.escalaDolor !== undefined) {
      if (signos.escalaDolor >= 7) {
        alertas.push({
          parametro: 'Dolor (Escala EVA)',
          valor: `${signos.escalaDolor}/10`,
          severidad: 'CRITICA',
          mensaje: 'Dolor agudo de intensidad severa (EVA >= 7).',
          recomendacion: 'Administrar analgesia pautada de rescate y proveer postura antiálgica.',
        });
      } else if (signos.escalaDolor >= 4) {
        alertas.push({
          parametro: 'Dolor (Escala EVA)',
          valor: `${signos.escalaDolor}/10`,
          severidad: 'ADVERTENCIA',
          mensaje: 'Dolor de intensidad moderada (EVA 4-6).',
          recomendacion: 'Verificar horario de analgésicos prescritos y aplicar medidas de confort.',
        });
      }
    }

    // 7. Glicemia Capilar
    if (signos.glicemiaCapilar !== undefined) {
      if (signos.glicemiaCapilar < 70) {
        alertas.push({
          parametro: 'Glicemia Capilar',
          valor: `${signos.glicemiaCapilar} mg/dL`,
          severidad: 'CRITICA',
          mensaje: 'Hipoglicemia (< 70 mg/dL).',
          recomendacion: 'Administrar carbohidratos orales o solución glucosada EV según protocolo médico de urgencia.',
        });
      } else if (signos.glicemiaCapilar > 250) {
        alertas.push({
          parametro: 'Glicemia Capilar',
          valor: `${signos.glicemiaCapilar} mg/dL`,
          severidad: 'CRITICA',
          mensaje: 'Hiperglicemia marcada (> 250 mg/dL).',
          recomendacion: 'Verificar esquema de insulina de corrección y avisar a médico tratante.',
        });
      } else if (signos.glicemiaCapilar > 180) {
        alertas.push({
          parametro: 'Glicemia Capilar',
          valor: `${signos.glicemiaCapilar} mg/dL`,
          severidad: 'ADVERTENCIA',
          mensaje: 'Glicemia elevada (> 180 mg/dL).',
          recomendacion: 'Monitorizar dextrostix antes de cada comida o por turno.',
        });
      }
    }

    return alertas;
  }

  /**
   * Genera los diagnósticos de enfermería según el Proceso de Atención de Enfermería (PAE)
   * con formulación estándar venezolana PES (Problema NANDA, Etiología r/c, Signos y síntomas m/p).
   */
  generarDiagnosticosPae(params: EvaluarDiagnosticoDto): IDiagnosticoEnfermeriaKardex[] {
    const textoAnalisis = [
      params.diagnosticoMedico || '',
      ...(params.sintomasOProblemas || []),
      ...(params.antecedentesOCondiciones || []),
      ...(params.dispositivosPresentes || []),
    ]
      .join(' ')
      .toLowerCase();

    const diagnosticosGenerados: IDiagnosticoEnfermeriaKardex[] = [];
    const codigosIncluidos = new Set<string>();

    const signos = params.signosVitales;

    // 1. Regla de Dolor Agudo
    const tieneDolor =
      (signos?.escalaDolor !== undefined && signos.escalaDolor >= 3) ||
      textoAnalisis.includes('dolor') ||
      textoAnalisis.includes('colico') ||
      textoAnalisis.includes('quirurgic') ||
      textoAnalisis.includes('herida') ||
      textoAnalisis.includes('postoperatorio');

    if (tieneDolor) {
      const item = CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA.find((d) => d.codigoNanda === '00132');
      if (item && !codigosIncluidos.has(item.codigoNanda)) {
        codigosIncluidos.add(item.codigoNanda);
        const eva = signos?.escalaDolor ?? 6;
        const etiologia = [
          textoAnalisis.includes('quirurgic') || textoAnalisis.includes('postoperat')
            ? 'Procedimiento quirúrgico y traumatismo tisular reciente'
            : 'Proceso inflamatorio o infeccioso agudo',
        ];
        const manifestaciones = [
          `Reporte verbal del paciente en escala EVA ${eva}/10`,
          'Facies de dolor y postura antiálgica defensiva',
          ...(signos?.frecuenciaCardiaca && signos.frecuenciaCardiaca > 90 ? ['Taquicardia reactiva'] : []),
        ];

        const prioridad: PrioridadDiagnostico = eva >= 7 ? 'Alta' : 'Media';

        diagnosticosGenerados.push({
          codigoNanda: item.codigoNanda,
          etiquetaDiagnostica: item.etiquetaDiagnostica,
          dominio: item.dominio,
          clase: item.clase,
          tipo: item.tipo,
          prioridad,
          factoresRelacionados: etiologia,
          caracteristicasDefinitorias: manifestaciones,
          enunciadoDiagnostico: `${item.etiquetaDiagnostica} r/c ${etiologia[0]} m/p ${manifestaciones.join(', ')}.`,
          objetivosNoc: item.objetivosNocSugeridos,
          intervencionesNic: item.intervencionesNicSugeridas,
          estadoEvaluacion: 'En proceso',
        });
      }
    }

    // 2. Regla de Hipertermia
    const tieneFiebre =
      (signos?.temperatura !== undefined && signos.temperatura >= 37.8) ||
      textoAnalisis.includes('fiebre') ||
      textoAnalisis.includes('febril') ||
      textoAnalisis.includes('hipertermia');

    if (tieneFiebre) {
      const item = CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA.find((d) => d.codigoNanda === '00007');
      if (item && !codigosIncluidos.has(item.codigoNanda)) {
        codigosIncluidos.add(item.codigoNanda);
        const temp = signos?.temperatura ? `${signos.temperatura}°C` : 'superior a 38.0°C';
        const etiologia = ['Proceso infeccioso activo y respuesta inflamatoria sistémica'];
        const manifestaciones = [
          `Temperatura corporal axilar registrada de ${temp}`,
          'Piel caliente y rubicundez facial',
          'Diaforesis y aumento en la frecuencia de pulso',
        ];

        diagnosticosGenerados.push({
          codigoNanda: item.codigoNanda,
          etiquetaDiagnostica: item.etiquetaDiagnostica,
          dominio: item.dominio,
          clase: item.clase,
          tipo: item.tipo,
          prioridad: signos?.temperatura && signos.temperatura >= 39 ? 'Alta' : 'Media',
          factoresRelacionados: etiologia,
          caracteristicasDefinitorias: manifestaciones,
          enunciadoDiagnostico: `${item.etiquetaDiagnostica} r/c ${etiologia[0]} m/p ${manifestaciones.join(', ')}.`,
          objetivosNoc: item.objetivosNocSugeridos,
          intervencionesNic: item.intervencionesNicSugeridas,
          estadoEvaluacion: 'En proceso',
        });
      }
    }

    // 3. Regla de Patrón Respiratorio Ineficaz
    const tieneCompromisoRespiratorio =
      (signos?.saturacionOxigeno !== undefined && signos.saturacionOxigeno < 94) ||
      (signos?.frecuenciaRespiratoria !== undefined && signos.frecuenciaRespiratoria > 22) ||
      textoAnalisis.includes('disnea') ||
      textoAnalisis.includes('respirat') ||
      textoAnalisis.includes('neumon') ||
      textoAnalisis.includes('asma') ||
      textoAnalisis.includes('epoc');

    if (tieneCompromisoRespiratorio) {
      const item = CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA.find((d) => d.codigoNanda === '00032');
      if (item && !codigosIncluidos.has(item.codigoNanda)) {
        codigosIncluidos.add(item.codigoNanda);
        const etiologia = ['Fatiga muscular ventilatoria o restricción por dolor o acúmulo de secreciones'];
        const manifestaciones = [
          signos?.frecuenciaRespiratoria ? `Taquipnea (${signos.frecuenciaRespiratoria} rpm)` : 'Frecuencia respiratoria elevada',
          signos?.saturacionOxigeno ? `Disminución de la saturación de oxígeno periférica (${signos.saturacionOxigeno}%)` : 'Oximetría disminuida',
          'Tiraje intercostal o esfuerzo respiratorio visible',
        ];

        diagnosticosGenerados.push({
          codigoNanda: item.codigoNanda,
          etiquetaDiagnostica: item.etiquetaDiagnostica,
          dominio: item.dominio,
          clase: item.clase,
          tipo: item.tipo,
          prioridad: 'Alta',
          factoresRelacionados: etiologia,
          caracteristicasDefinitorias: manifestaciones,
          enunciadoDiagnostico: `${item.etiquetaDiagnostica} r/c ${etiologia[0]} m/p ${manifestaciones.join(', ')}.`,
          objetivosNoc: item.objetivosNocSugeridos,
          intervencionesNic: item.intervencionesNicSugeridas,
          estadoEvaluacion: 'En proceso',
        });
      }
    }

    // 4. Regla de Riesgo de Infección
    const tieneRiesgoInfeccion =
      textoAnalisis.includes('via venosa') ||
      textoAnalisis.includes('cateter') ||
      textoAnalisis.includes('sonda') ||
      textoAnalisis.includes('quirurg') ||
      textoAnalisis.includes('herida') ||
      textoAnalisis.includes('drenaje') ||
      params.dispositivosPresentes?.length;

    if (tieneRiesgoInfeccion) {
      const item = CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA.find((d) => d.codigoNanda === '00004');
      if (item && !codigosIncluidos.has(item.codigoNanda)) {
        codigosIncluidos.add(item.codigoNanda);
        const etiologia = [
          'Procedimientos invasivos activos (acceso venoso periférico, catéter, sondajes) y alteración de barreras primarias.',
        ];

        diagnosticosGenerados.push({
          codigoNanda: item.codigoNanda,
          etiquetaDiagnostica: item.etiquetaDiagnostica,
          dominio: item.dominio,
          clase: item.clase,
          tipo: 'Riesgo',
          prioridad: 'Media',
          factoresRelacionados: etiologia,
          caracteristicasDefinitorias: [],
          enunciadoDiagnostico: `${item.etiquetaDiagnostica} r/c ${etiologia[0]}`,
          objetivosNoc: item.objetivosNocSugeridos,
          intervencionesNic: item.intervencionesNicSugeridas,
          estadoEvaluacion: 'En proceso',
        });
      }
    }

    // 5. Regla de Riesgo de Deterioro de la Integridad Cutánea (UPP)
    const tieneRiesgoCutaneo =
      textoAnalisis.includes('reposo absoluto') ||
      textoAnalisis.includes('encamado') ||
      textoAnalisis.includes('inmovil') ||
      textoAnalisis.includes('escaras') ||
      params.edad >= 70;

    if (tieneRiesgoCutaneo) {
      const item = CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA.find((d) => d.codigoNanda === '00047');
      if (item && !codigosIncluidos.has(item.codigoNanda)) {
        codigosIncluidos.add(item.codigoNanda);
        const etiologia = [
          'Inmovilidad física prolongada en cama y presión mantenida sobre prominencias óseas (sacro, talones).',
        ];

        diagnosticosGenerados.push({
          codigoNanda: item.codigoNanda,
          etiquetaDiagnostica: item.etiquetaDiagnostica,
          dominio: item.dominio,
          clase: item.clase,
          tipo: 'Riesgo',
          prioridad: 'Media',
          factoresRelacionados: etiologia,
          caracteristicasDefinitorias: [],
          enunciadoDiagnostico: `${item.etiquetaDiagnostica} r/c ${etiologia[0]}`,
          objetivosNoc: item.objetivosNocSugeridos,
          intervencionesNic: item.intervencionesNicSugeridas,
          estadoEvaluacion: 'En proceso',
        });
      }
    }

    // 6. Regla de Déficit de Volumen de Líquidos
    const tieneDeficitLiquidos =
      textoAnalisis.includes('deshidrat') ||
      textoAnalisis.includes('vomito') ||
      textoAnalisis.includes('diarrea') ||
      textoAnalisis.includes('hemorrag') ||
      textoAnalisis.includes('sangrado') ||
      (signos?.tensionArterial && signos.tensionArterial.startsWith('80/'));

    if (tieneDeficitLiquidos) {
      const item = CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA.find((d) => d.codigoNanda === '00027');
      if (item && !codigosIncluidos.has(item.codigoNanda)) {
        codigosIncluidos.add(item.codigoNanda);
        const etiologia = ['Pérdidas activas de líquidos biológicos y balance hídrico negativo'];
        const manifestaciones = [
          'Sequedad de piel y mucosas orales',
          'Disminución del volumen urinario',
          'Tendencia a la hipotensión y debilidad generalizada',
        ];

        diagnosticosGenerados.push({
          codigoNanda: item.codigoNanda,
          etiquetaDiagnostica: item.etiquetaDiagnostica,
          dominio: item.dominio,
          clase: item.clase,
          tipo: item.tipo,
          prioridad: 'Alta',
          factoresRelacionados: etiologia,
          caracteristicasDefinitorias: manifestaciones,
          enunciadoDiagnostico: `${item.etiquetaDiagnostica} r/c ${etiologia[0]} m/p ${manifestaciones.join(', ')}.`,
          objetivosNoc: item.objetivosNocSugeridos,
          intervencionesNic: item.intervencionesNicSugeridas,
          estadoEvaluacion: 'En proceso',
        });
      }
    }

    // 7. Regla de Riesgo de Caídas
    const tieneRiesgoCaidas =
      params.edad >= 65 ||
      textoAnalisis.includes('caida') ||
      textoAnalisis.includes('mareo') ||
      textoAnalisis.includes('inestab') ||
      textoAnalisis.includes('sedacion') ||
      textoAnalisis.includes('tercera edad');

    if (tieneRiesgoCaidas) {
      const item = CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA.find((d) => d.codigoNanda === '00155');
      if (item && !codigosIncluidos.has(item.codigoNanda)) {
        codigosIncluidos.add(item.codigoNanda);
        const etiologia = [
          `Edad avanzada (${params.edad} años), debilidad muscular y entorno hospitalario poco familiar.`,
        ];

        diagnosticosGenerados.push({
          codigoNanda: item.codigoNanda,
          etiquetaDiagnostica: item.etiquetaDiagnostica,
          dominio: item.dominio,
          clase: item.clase,
          tipo: 'Riesgo',
          prioridad: 'Media',
          factoresRelacionados: etiologia,
          caracteristicasDefinitorias: [],
          enunciadoDiagnostico: `${item.etiquetaDiagnostica} r/c ${etiologia[0]}`,
          objetivosNoc: item.objetivosNocSugeridos,
          intervencionesNic: item.intervencionesNicSugeridas,
          estadoEvaluacion: 'En proceso',
        });
      }
    }

    // 8. Regla de Ansiedad (si no hay suficientes o si está explícito)
    if (
      diagnosticosGenerados.length === 0 ||
      textoAnalisis.includes('ansiedad') ||
      textoAnalisis.includes('angustia') ||
      textoAnalisis.includes('nervios') ||
      textoAnalisis.includes('temor')
    ) {
      const item = CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA.find((d) => d.codigoNanda === '00146');
      if (item && !codigosIncluidos.has(item.codigoNanda)) {
        codigosIncluidos.add(item.codigoNanda);
        const etiologia = ['Hospitalización, dolor e incertidumbre acerca de la condición de salud o procedimiento'];
        const manifestaciones = [
          'Inquietud, preocupación manifiesta verbalmente por el paciente',
          'Facies de tensión o nerviosismo en la interacción con el personal de salud',
        ];

        diagnosticosGenerados.push({
          codigoNanda: item.codigoNanda,
          etiquetaDiagnostica: item.etiquetaDiagnostica,
          dominio: item.dominio,
          clase: item.clase,
          tipo: item.tipo,
          prioridad: 'Baja',
          factoresRelacionados: etiologia,
          caracteristicasDefinitorias: manifestaciones,
          enunciadoDiagnostico: `${item.etiquetaDiagnostica} r/c ${etiologia[0]} m/p ${manifestaciones.join(', ')}.`,
          objetivosNoc: item.objetivosNocSugeridos,
          intervencionesNic: item.intervencionesNicSugeridas,
          estadoEvaluacion: 'En proceso',
        });
      }
    }

    // Ordenar por prioridad: Alta > Media > Baja
    const pesoPrioridad = { Alta: 3, Media: 2, Baja: 1 };
    return diagnosticosGenerados.sort((a, b) => pesoPrioridad[b.prioridad] - pesoPrioridad[a.prioridad]);
  }

  /**
   * Genera el borrador estructurado de evolución bajo la metodología estándar venezolana SOAPIE
   */
  generarNotaSoapie(data: {
    paciente?: any;
    diagnosticos: IDiagnosticoEnfermeriaKardex[];
    signosVitales?: ISignosVitales;
    alertas?: IAlertaClinica[];
    sintomas?: string[];
  }): INotaSoapie {
    const diagPrincipal = data.diagnosticos[0];
    const signos = data.signosVitales;

    // S (Subjetivo)
    let s = 'Paciente lúcido, orientado en tiempo, espacio y persona.';
    if (data.sintomas && data.sintomas.length > 0) {
      s = `Paciente refiere: "${data.sintomas.join(', ')}".`;
    } else if (signos?.escalaDolor && signos.escalaDolor > 0) {
      s = `Paciente refiere dolor localizado con intensidad ${signos.escalaDolor}/10 en escala EVA.`;
    }

    // O (Objetivo)
    const partesObj: string[] = [];
    if (signos) {
      if (signos.tensionArterial) partesObj.push(`TA: ${signos.tensionArterial} mmHg`);
      if (signos.frecuenciaCardiaca) partesObj.push(`FC: ${signos.frecuenciaCardiaca} lpm`);
      if (signos.frecuenciaRespiratoria) partesObj.push(`FR: ${signos.frecuenciaRespiratoria} rpm`);
      if (signos.temperatura) partesObj.push(`T°: ${signos.temperatura} °C`);
      if (signos.saturacionOxigeno) partesObj.push(`SpO2: ${signos.saturacionOxigeno}%`);
      if (signos.escalaDolor !== undefined) partesObj.push(`EVA: ${signos.escalaDolor}/10`);
    }
    const o = `Constantes vitales: ${partesObj.join(', ') || 'Signos vitales estables'}. Se observa tranquilo en su unidad hospitalaria.`;

    // A (Análisis / Apreciación Diagnóstica)
    const a = diagPrincipal
      ? diagPrincipal.enunciadoDiagnostico
      : 'Paciente en condición clínica estable, respondiendo al plan de cuidados de enfermería instaurado.';

    // P (Planificación)
    let p = 'Brindar confort, mantener vigilancia estrecha de signos vitales y cumplir tratamiento pautado.';
    if (diagPrincipal?.objetivosNoc && diagPrincipal.objetivosNoc.length > 0) {
      p = diagPrincipal.objetivosNoc.map((obj) => obj.resultadoEsperado).join('; ') + '.';
    }

    // I (Intervenciones de Enfermería)
    const intervenciones: string[] = [
      'Control y registro de signos vitales por turno.',
      'Administración de medicamentos prescritos según horario y vía.',
    ];
    if (diagPrincipal?.intervencionesNic && diagPrincipal.intervencionesNic.length > 0) {
      const nic = diagPrincipal.intervencionesNic[0];
      if (nic.acciones && nic.acciones.length > 0) {
        intervenciones.push(...nic.acciones.slice(0, 2));
      }
    }
    const i = intervenciones.join(' ');

    // E (Evaluación)
    const e =
      'Paciente tolera los cuidados administrados, refiere mejoría de sus molestias y queda en reposo bajo observación continua del turno.';

    return {
      subjetivo: s,
      objetivo: o,
      analisis: a,
      planificacion: p,
      intervencion: i,
      evaluacion: e,
    };
  }

  /**
   * Asegura que un diagnóstico cumpla con la estructura formal venezolana PES
   */
  formularEnunciadoPes(item: Partial<IDiagnosticoEnfermeriaKardex>): string {
    const problema = item.etiquetaDiagnostica || 'Problema de enfermería';
    const rC = item.factoresRelacionados?.length
      ? item.factoresRelacionados.join(', ')
      : 'factores clínicos subyacentes';
    const mP = item.caracteristicasDefinitorias?.length
      ? item.caracteristicasDefinitorias.join(', ')
      : undefined;

    if (item.tipo === 'Riesgo' || !mP) {
      return `${problema} r/c ${rC}`;
    }
    return `${problema} r/c ${rC} m/p ${mP}`;
  }
}
