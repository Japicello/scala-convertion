import { TurnoHospitalario } from '../interfaces/kardex.interface';

export const FORMATO_VENEZUELA_DEFAULT = {
  pais: 'República Bolivariana de Venezuela',
  ministerio: 'Ministerio del Poder Popular para la Salud (MPPS)',
  institucionDefault: 'Hospital General Universitario',
  servicioDefault: 'Medicina Interna',
};

export const TURNOS_HOSPITALARIOS_VENEZUELA: Record<
  TurnoHospitalario,
  { horario: string; descripcion: string; horas: number[] }
> = {
  Mañana: {
    horario: '07:00 - 13:00',
    descripcion: 'Turno de la Mañana (Guardia Diurna I)',
    horas: [7, 8, 9, 10, 11, 12],
  },
  Tarde: {
    horario: '13:00 - 19:00',
    descripcion: 'Turno de la Tarde (Guardia Diurna II)',
    horas: [13, 14, 15, 16, 17, 18],
  },
  Noche: {
    horario: '19:00 - 07:00',
    descripcion: 'Turno de la Noche (Guardia Nocturna)',
    horas: [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6],
  },
  Todos: {
    horario: 'Continuo 24 horas',
    descripcion: 'Cuidados transversales las 24 horas',
    horas: Array.from({ length: 24 }, (_, i) => i),
  },
};

export const DIETAS_ESTANDAR_VENEZUELA = [
  'Absoluta / Nada por Vía Oral (NVO)',
  'Líquida Clara',
  'Líquida Completa / Amplia',
  'Blanda Mecánica / Asistida',
  'Hiposódica Estricta (< 2g Na)',
  'Hiposódica Moderada',
  'Diabética (1500 - 1800 kcal)',
  'Hiperproteica / Hipercalórica',
  'Astringente',
  'Gastroclisis / Enteral por Sonda',
  'Nutrición Parenteral Total (NPT)',
  'Normal / Completa',
];

export const VIAS_ADMINISTRACION_ESTANDAR = [
  'EV (Endovenosa / Intravenosa)',
  'IM (Intramuscular)',
  'VO (Vía Oral)',
  'SC (Subcutánea)',
  'SL (Sublingual)',
  'Inhalatoria / Nebulización',
  'Tópica / Cutánea',
  'Oftálmica',
  'Ótica',
  'Rectal',
];

export const CONDICIONES_MOVILIDAD_ESTANDAR = [
  'Reposo Absoluto en Cama',
  'Reposo Relativo',
  'Posición Semifowler (30°)',
  'Posición Fowler Alta (45° - 90°)',
  'Decúbito Lateral con Cambios Posturales c/2h',
  'Trendelenburg',
  'Deambulación Asistida',
  'Deambulación Libre',
];

export interface ICatalogoDiagnosticoItem {
  codigoNanda: string;
  etiquetaDiagnostica: string;
  dominio: string;
  clase: string;
  tipo: 'Real' | 'Riesgo' | 'Salud / Bienestar';
  factoresRelacionadosComunes: string[];
  caracteristicasDefinitoriasComunes: string[];
  objetivosNocSugeridos: Array<{
    codigo?: string;
    resultadoEsperado: string;
    indicador?: string;
    escalaMeta?: string;
  }>;
  intervencionesNicSugeridas: Array<{
    codigo?: string;
    intervencion: string;
    acciones: string[];
    turno?: TurnoHospitalario;
  }>;
  palabrasClaveMatch: string[];
}

export const CATALOGO_DIAGNOSTICOS_PAE_VENEZUELA: ICatalogoDiagnosticoItem[] = [
  {
    codigoNanda: '00132',
    etiquetaDiagnostica: 'Dolor agudo',
    dominio: 'Dominio 12: Confort',
    clase: 'Clase 1: Confort físico',
    tipo: 'Real',
    palabrasClaveMatch: ['dolor', 'algesia', 'postoperatorio', 'colico', 'trauma', 'cefalea', 'artralgia', 'mialgia'],
    factoresRelacionadosComunes: [
      'Agentes lesivos físicos (procedimiento quirúrgico, trauma, heridas)',
      'Agentes lesivos biológicos (procesos infecciosos o inflamatorios)',
      'Isquemia tisular o espasmo muscular',
    ],
    caracteristicasDefinitoriasComunes: [
      'Reporte verbal del paciente en escala EVA >= 4/10',
      'Expresión facial y postura antiálgica',
      'Diaforesis, cambios en la presión arterial y taquicardia reactiva',
      'Conducta de defensa o protección de la zona dolorosa',
    ],
    objetivosNocSugeridos: [
      {
        codigo: '1605',
        resultadoEsperado: 'Control del dolor',
        indicador: 'Reconoce el comienzo del dolor y utiliza medidas de alivio no farmacológicas y farmacológicas',
        escalaMeta: 'Puntaje diana: 4/5 (Frecuentemente demostrado)',
      },
      {
        codigo: '2102',
        resultadoEsperado: 'Nivel del dolor',
        indicador: 'Dolor referido disminuye a nivel tolerable (EVA <= 3/10)',
        escalaMeta: 'Puntaje diana: 4/5 (Leve a ausente)',
      },
    ],
    intervencionesNicSugeridas: [
      {
        codigo: '2210',
        intervencion: 'Manejo del dolor agudo',
        acciones: [
          'Realizar valoración exhaustiva del dolor (localización, características, aparición, duración, frecuencia, intensidad en EVA).',
          'Asegurarse de que el paciente reciba atención analgésica inmediata prescrita según orden médica.',
          'Proporcionar medidas de confort físico: cambios de posición a postura antiálgica.',
          'Reevaluar escala del dolor a los 30-45 minutos tras administración de analgésico EV o VO.',
        ],
        turno: 'Todos',
      },
      {
        codigo: '2300',
        intervencion: 'Administración de medicación prescrita',
        acciones: [
          'Cumplir los 5 correctos de administración de medicamentos.',
          'Verificar permeabilidad de la vía venosa antes de administrar analgésicos EV.',
          'Monitorear reacciones adversas y signos vitales post-administración.',
        ],
        turno: 'Todos',
      },
    ],
  },
  {
    codigoNanda: '00007',
    etiquetaDiagnostica: 'Hipertermia',
    dominio: 'Dominio 11: Seguridad/Protección',
    clase: 'Clase 6: Termorregulación',
    tipo: 'Real',
    palabrasClaveMatch: ['fiebre', 'hipertermia', 'febril', 'febril', 'temperatura', 'calentura'],
    factoresRelacionadosComunes: [
      'Proceso infeccioso activo o inflamación sistémica',
      'Deshidratación o incremento de la tasa metabólica',
      'Reacción a medicamentos o hemoderivados',
    ],
    caracteristicasDefinitoriasComunes: [
      'Temperatura corporal axilar superior a 37.8°C',
      'Piel caliente al tacto y enrojecida (rubicundez)',
      'Taquicardia y taquipnea concomitante',
      'Escalofríos, cefalea o diaforesis profusa',
    ],
    objetivosNocSugeridos: [
      {
        codigo: '0800',
        resultadoEsperado: 'Termorregulación adecuada',
        indicador: 'Temperatura corporal dentro de parámetros normales (36.5°C - 37.2°C)',
        escalaMeta: 'Puntaje diana: 5/5 (Sin desviación del rango normal)',
      },
    ],
    intervencionesNicSugeridas: [
      {
        codigo: '3740',
        intervencion: 'Tratamiento de la fiebre / Medios físicos',
        acciones: [
          'Monitorear temperatura corporal cada 2 a 4 horas o según respuesta.',
          'Aplicar medios físicos de enfriamiento (compresas tibias en axilas, ingles y frente; evitar hielo directo).',
          'Favorecer la ventilación ambiental y retirar exceso de ropa de cama.',
          'Administrar antipiréticos prescritos según orden médica (Dipirona, Paracetamol EV/VO).',
          'Vigilar balance hídrico y asegurar hidratación adecuada para compensar pérdidas insensibles.',
        ],
        turno: 'Todos',
      },
    ],
  },
  {
    codigoNanda: '00004',
    etiquetaDiagnostica: 'Riesgo de infección',
    dominio: 'Dominio 11: Seguridad/Protección',
    clase: 'Clase 1: Infección',
    tipo: 'Riesgo',
    palabrasClaveMatch: ['infeccion', 'quirurgico', 'herida', 'via venosa', 'cateter', 'sonda', 'foley', 'leucocitosis'],
    factoresRelacionadosComunes: [
      'Procedimientos invasivos (catéter venoso periférico/central, sonda vesical)',
      'Alteración de las defensas primarias (herida quirúrgica, pérdida de integridad cutánea)',
      'Inmunosupresión o patologías crónicas descompensadas',
    ],
    caracteristicasDefinitoriasComunes: [],
    objetivosNocSugeridos: [
      {
        codigo: '1902',
        resultadoEsperado: 'Control del riesgo: Infección hospitalaria',
        indicador: 'Ausencia de signos locales de flebitis, secreción purulenta o eritema en accesos y heridas',
        escalaMeta: 'Puntaje diana: 5/5 (Sin signos infecciosos)',
      },
    ],
    intervencionesNicSugeridas: [
      {
        codigo: '6540',
        intervencion: 'Control y prevención de infecciones intrahospitalarias',
        acciones: [
          'Lavado estricto de manos clínico antes y después de cada procedimiento según protocolo OMS/MPPS.',
          'Inspeccionar el sitio de punción de la vía venosa periférica en busca de signos de flebitis o extravasación.',
          'Realizar curación estéril de herida quirúrgica o sitios de inserción de catéteres según indicación.',
          'Mantener bolsa colectora de orina por debajo del nivel de la vejiga y circuito cerrado estéril.',
          'Monitorear curvas térmicas y reporte de fórmula blanca (leucocitos) en hematología.',
        ],
        turno: 'Todos',
      },
    ],
  },
  {
    codigoNanda: '00032',
    etiquetaDiagnostica: 'Patrón respiratorio ineficaz',
    dominio: 'Dominio 4: Actividad/Reposo',
    clase: 'Clase 4: Respuestas cardiovasculares/pulmonares',
    tipo: 'Real',
    palabrasClaveMatch: ['disnea', 'respiratorio', 'taquipnea', 'oxigeno', 'sat', 'cianosis', 'pulmonar', 'asma', 'epoc', 'neumonia'],
    factoresRelacionadosComunes: [
      'Hiperventilación reactiva o fatiga de músculos respiratorios',
      'Dolor torácico o abdominal alto que limita la mecánica ventilatoria',
      'Acúmulo de secreciones o proceso broncoespástico',
    ],
    caracteristicasDefinitoriasComunes: [
      'Frecuencia respiratoria alterada (FR > 22 rpm o < 12 rpm)',
      'Saturación de oxígeno por pulsioximetría (SpO2 < 94% al aire ambiente)',
      'Uso de músculos accesorios de la respiración y aleteo nasal',
      'Disnea de reposo o moderado esfuerzo',
    ],
    objetivosNocSugeridos: [
      {
        codigo: '0415',
        resultadoEsperado: 'Estado respiratorio: Ventilación',
        indicador: 'Frecuencia respiratoria en rango de 14-20 rpm y SpO2 >= 95%',
        escalaMeta: 'Puntaje diana: 4/5 (Levemente comprometido a no comprometido)',
      },
    ],
    intervencionesNicSugeridas: [
      {
        codigo: '3320',
        intervencion: 'Oxigenoterapia y monitorización respiratoria',
        acciones: [
          'Colocar al paciente en posición Fowler o Semifowler para optimizar la expansión torácica.',
          'Administrar oxígeno suplementario húmedo por cánula o mascarilla según prescripción médica.',
          'Monitorear saturación periférica continua de oxígeno (SpO2) y frecuencia respiratoria.',
          'Auscultar campos pulmonares en busca de estertores, sibilancias o hipoventilación.',
          'Fomentar ejercicios respiratorios con respiración diafragmática y tos asistida.',
        ],
        turno: 'Todos',
      },
    ],
  },
  {
    codigoNanda: '00047',
    etiquetaDiagnostica: 'Riesgo de deterioro de la integridad cutánea',
    dominio: 'Dominio 11: Seguridad/Protección',
    clase: 'Clase 2: Lesión física',
    tipo: 'Riesgo',
    palabrasClaveMatch: ['inmovilidad', 'encamado', 'ulcera', 'piel', 'escaras', 'upp', 'edad avanzada', 'paraplejia'],
    factoresRelacionadosComunes: [
      'Inmovilidad física prolongada en cama o déficit sensorial',
      'Humedad excesiva por diaforesis o incontinencia esfinteriana',
      'Estado nutricional comprometido (hipoalbuminemia, desnutrición)',
      'Presión mantenida sobre prominencias óseas (sacro, talones, trocánteres)',
    ],
    caracteristicasDefinitoriasComunes: [],
    objetivosNocSugeridos: [
      {
        codigo: '1101',
        resultadoEsperado: 'Integridad tisular: Piel y membranas mucosas',
        indicador: 'Piel intacta, hidratada, libre de eritemas no blanqueables en zonas de presión',
        escalaMeta: 'Puntaje diana: 5/5 (Completamente intacta)',
      },
    ],
    intervencionesNicSugeridas: [
      {
        codigo: '3540',
        intervencion: 'Prevención de úlceras por presión (UPP)',
        acciones: [
          'Establecer y cumplir protocolo de cambios posturales rigurosos cada 2 horas (decúbito lateral derecho, supino, decúbito lateral izquierdo).',
          'Mantener sábanas limpias, secas y completamente estiradas (sin pliegues ni arrugas).',
          'Hidratar la piel con crema emoliente o ácidos grasos hiperoxigenados sin masajear sobre prominencias óseas.',
          'Utilizar taloneras acolchadas o almohadas para descargar zonas de presión crítica.',
          'Valorar escala de Braden o Norton por turno para estratificar el riesgo.',
        ],
        turno: 'Todos',
      },
    ],
  },
  {
    codigoNanda: '00027',
    etiquetaDiagnostica: 'Déficit de volumen de líquidos',
    dominio: 'Dominio 2: Nutrición',
    clase: 'Clase 5: Hidratación',
    tipo: 'Real',
    palabrasClaveMatch: ['deshidratacion', 'vomitos', 'diarrea', 'sangrado', 'hemorragia', 'poliuria', 'hipotension', 'sed'],
    factoresRelacionadosComunes: [
      'Pérdidas activas de líquidos por vía gastrointestinal (vómitos, diarreas abundantes)',
      'Drenajes quirúrgicos con alto débito o sangrado agudo',
      'Aporte insuficiente de líquidos orales o endovenosos',
    ],
    caracteristicasDefinitoriasComunes: [
      'Sequedad de piel y mucosas orales, signo del pliegue positivo',
      'Disminución del gasto urinario (< 0.5 ml/kg/h) u orina concentrada',
      'Hipotensión arterial y taquicardia compensatoria',
      'Sensación intensa de sed y debilidad general',
    ],
    objetivosNocSugeridos: [
      {
        codigo: '0601',
        resultadoEsperado: 'Equilibrio hídrico',
        indicador: 'Presión arterial y pulso dentro de límites normales, turgencia cutánea adecuada y balance hídrico neutro a positivo',
        escalaMeta: 'Puntaje diana: 4/5 (Sustancialmente comprometido a normal)',
      },
    ],
    intervencionesNicSugeridas: [
      {
        codigo: '4120',
        intervencion: 'Manejo de líquidos y electrólitos',
        acciones: [
          'Mantener infusión de soluciones parenterales (Solución Fisiológica 0.9%, Ringer Lactato) al goteo indicado por médico.',
          'Llevar control estricto de balance hídrico (ingresos vs egresos) en cada relevo de guardia.',
          'Monitorear signos vitales con énfasis en TA y FC cada 2 a 4 horas.',
          'Evaluar estado de hidratación: mucosas, turgencia de la piel, llenado capilar y diuresis horaria.',
          'Notificar de inmediato diuresis menor a 30 ml/h en pacientes adultos.',
        ],
        turno: 'Todos',
      },
    ],
  },
  {
    codigoNanda: '00155',
    etiquetaDiagnostica: 'Riesgo de caídas',
    dominio: 'Dominio 11: Seguridad/Protección',
    clase: 'Clase 2: Lesión física',
    tipo: 'Riesgo',
    palabrasClaveMatch: ['caida', 'inestabilidad', 'mareo', 'sedacion', 'tercera edad', 'anciano', 'deterioro cognitivo'],
    factoresRelacionadosComunes: [
      'Deterioro de la movilidad física o debilidad muscular',
      'Efectos secundarios de medicamentos sedantes, antihipertensivos o analgésicos opioides',
      'Ambiente hospitalario no familiar y barreras físicas',
    ],
    caracteristicasDefinitoriasComunes: [],
    objetivosNocSugeridos: [
      {
        codigo: '1912',
        resultadoEsperado: 'Caídas prevenidas',
        indicador: 'El paciente permanece libre de caídas o traumatismos durante su estancia',
        escalaMeta: 'Puntaje diana: 5/5 (Sin caídas)',
      },
    ],
    intervencionesNicSugeridas: [
      {
        codigo: '6490',
        intervencion: 'Prevención de caídas hospitalarias',
        acciones: [
          'Mantener las barandas de la cama elevadas en todo momento.',
          'Colocar la cama en la posición más baja con frenos activados.',
          'Orientar al paciente y al familiar acompañante sobre el uso del timbre de llamado de enfermería.',
          'Asegurar iluminación adecuada en la habitación durante la noche y pasillos libres de obstáculos.',
          'Asistir en la deambulación y traslados al baño de ser necesario.',
        ],
        turno: 'Todos',
      },
    ],
  },
  {
    codigoNanda: '00146',
    etiquetaDiagnostica: 'Ansiedad',
    dominio: 'Dominio 9: Afrontamiento/Tolerancia al estrés',
    clase: 'Clase 2: Respuestas de afrontamiento',
    tipo: 'Real',
    palabrasClaveMatch: ['ansiedad', 'angustia', 'temor', 'miedo', 'nerviosismo', 'preocupacion', 'inquietud', 'estres'],
    factoresRelacionadosComunes: [
      'Hospitalización e incertidumbre sobre el pronóstico médico o intervención quirúrgica',
      'Cambio en el entorno habitual y separación de la dinámica familiar',
      'Amenaza percibida de pérdida de la salud o autonomía',
    ],
    caracteristicasDefinitoriasComunes: [
      'Verbalización de preocupación, miedo, aprensión o angustia',
      'Inquietud motora, fascies tensa o temblor distal',
      'Incremento leve de la tensión arterial y taquicardia por descarga adrenérgica',
    ],
    objetivosNocSugeridos: [
      {
        codigo: '1402',
        resultadoEsperado: 'Autocontrol de la ansiedad',
        indicador: 'El paciente verbaliza disminución de la tensión y refiere sentirse más tranquilo',
        escalaMeta: 'Puntaje diana: 4/5 (Frecuentemente demostrado)',
      },
    ],
    intervencionesNicSugeridas: [
      {
        codigo: '5820',
        intervencion: 'Disminución de la ansiedad y apoyo emocional',
        acciones: [
          'Establecer una relación de empatía y escucha activa con el paciente.',
          'Explicar de forma sencilla y clara los procedimientos de enfermería a realizar antes de su ejecución.',
          'Fomentar la presencia de un familiar de apoyo cuando las normas de la sala lo permitan.',
          'Enseñar técnicas de respiración pausada y relajación.',
        ],
        turno: 'Todos',
      },
    ],
  },
];
