export type Sexo = 'M' | 'F' | 'OTRO';

export type TipoDiagnosticoEnfermeria = 'Real' | 'Riesgo' | 'Salud / Bienestar';

export type PrioridadDiagnostico = 'Alta' | 'Media' | 'Baja';

export type TurnoHospitalario = 'Mañana' | 'Tarde' | 'Noche' | 'Todos';

export type NivelSeveridadAlerta = 'CRITICA' | 'ADVERTENCIA' | 'NORMAL';

export interface ISignosVitales {
  tensionArterial?: string; // ej: "120/80"
  frecuenciaCardiaca?: number; // lpm
  frecuenciaRespiratoria?: number; // rpm
  temperatura?: number; // °C
  saturacionOxigeno?: number; // %
  escalaDolor?: number; // EVA 0 a 10
  glicemiaCapilar?: number; // mg/dL
  escalaGlasgow?: number; // 3 a 15
}

export interface IAlertaClinica {
  parametro: string;
  valor: string | number;
  severidad: NivelSeveridadAlerta;
  mensaje: string;
  recomendacion: string;
}

export interface IDispositivoInvasivo {
  tipo: 'ViaVenosaPeriferica' | 'CateterVenosoCentral' | 'SondaVesical' | 'SondaNasogastrica' | 'Drenaje' | 'Oxigenoterapia' | 'Otro';
  descripcion: string;
  calibreOUbicacion?: string;
  fechaInstalacion?: string;
  debitoOGasto?: string;
  observaciones?: string;
}

export interface IBalanceHidrico {
  requiereControl: boolean;
  ingresosCc?: number;
  egresosCc?: number;
  balanceAcumuladoCc?: number;
  periodoHoras?: number;
}

export interface IObjetivoNoc {
  codigo?: string;
  resultadoEsperado: string;
  indicador?: string;
  escalaMeta?: string;
}

export interface IIntervencionNic {
  codigo?: string;
  intervencion: string;
  acciones: string[];
  turno?: TurnoHospitalario;
}

export interface IDiagnosticoEnfermeriaKardex {
  codigoNanda: string;
  etiquetaDiagnostica: string;
  dominio: string;
  clase: string;
  tipo: TipoDiagnosticoEnfermeria;
  prioridad: PrioridadDiagnostico;
  factoresRelacionados: string[]; // r/c (Etiología)
  caracteristicasDefinitorias?: string[]; // m/p (Signos y síntomas)
  enunciadoDiagnostico: string; // Formulación PES completa
  objetivosNoc: IObjetivoNoc[];
  intervencionesNic: IIntervencionNic[];
  estadoEvaluacion?: 'En proceso' | 'Alcanzado' | 'Parcialmente alcanzado' | 'No alcanzado';
}

export interface IMedicamentoKardex {
  medicamento: string;
  presentacion?: string;
  dosis: string;
  via: 'EV' | 'IM' | 'VO' | 'SC' | 'SL' | 'Inhalatoria' | 'Topica' | 'Oftalmica' | 'Otica' | 'Rectal';
  frecuencia: string;
  horarios?: string[]; // ej: ["07:00", "15:00", "23:00"]
  distribucionTurnos?: {
    manana: boolean;
    tarde: boolean;
    noche: boolean;
  };
  observaciones?: string;
  fechaInicio?: string;
}

export interface INotaSoapie {
  subjetivo: string; // S: Lo que refiere el paciente o familiar
  objetivo: string; // O: Signos vitales y hallazgos objetivos
  analisis: string; // A: Apreciación diagnóstica de enfermería
  planificacion: string; // P: Plan trazado
  intervencion: string; // I: Intervenciones ejecutadas
  evaluacion: string; // E: Respuesta del paciente
}

export interface IResponsableEnfermeria {
  nombre: string;
  cargo?: string; // ej: "Licenciada en Enfermería", "TSU en Enfermería"
  matriculaMpps?: string; // Número de registro MPPS (Venezuela)
  colegioEnfermeros?: string; // Colegio de Profesionales de Enfermería
  turno?: TurnoHospitalario;
}

export interface IFichaKardexCompleta {
  id?: string;
  fechaRegistro: string;
  institucion: string;
  ministerioSalud?: string; // Default: "República Bolivariana de Venezuela - MPPS"
  servicio: string;
  cama: string;
  sala?: string;
  paciente: {
    nombres: string;
    apellidos: string;
    cedulaIdentidad?: string;
    historiaClinica: string;
    edad: number;
    unidadEdad?: 'años' | 'meses' | 'días';
    sexo: Sexo;
    fechaIngreso: string;
    diasHospitalizacion?: number;
    diagnosticoMedicoPrincipal: string;
    diagnosticosMedicosSecundarios?: string[];
    alergias: string[];
    tipoDieta: string;
    condicionMovilidad: string;
  };
  signosVitales: ISignosVitales;
  alertasClinicas?: IAlertaClinica[];
  balanceHidrico?: IBalanceHidrico;
  dispositivosInvasivos?: IDispositivoInvasivo[];
  diagnosticosEnfermeria: IDiagnosticoEnfermeriaKardex[];
  medicamentos: IMedicamentoKardex[];
  cuidadosEspeciales?: string[];
  laboratoriosPendientes?: string[];
  estudiosPendientes?: string[];
  interconsultasPendientes?: string[];
  pendientesRelevo?: string[];
  notaSOGuardia?: INotaSoapie;
  responsable?: IResponsableEnfermeria;
}
