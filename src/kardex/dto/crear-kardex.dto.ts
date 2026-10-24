import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SignosVitalesInputDto } from './evaluar-diagnostico.dto';

export class PacienteKardexDto {
  @ApiProperty({ example: 'María Elena', description: 'Nombres del paciente' })
  @IsNotEmpty()
  @IsString()
  nombres: string;

  @ApiProperty({ example: 'González Pérez', description: 'Apellidos del paciente' })
  @IsNotEmpty()
  @IsString()
  apellidos: string;

  @ApiPropertyOptional({ example: 'V-16.789.012', description: 'Cédula de Identidad venezolana (V-, E- o s/c)' })
  @IsOptional()
  @IsString()
  cedulaIdentidad?: string;

  @ApiProperty({ example: 'HC-84920', description: 'Número de Historia Clínica asignado por el hospital' })
  @IsNotEmpty()
  @IsString()
  historiaClinica: string;

  @ApiProperty({ example: 52, description: 'Edad del paciente' })
  @IsNumber()
  edad: number;

  @ApiPropertyOptional({ example: 'años', enum: ['años', 'meses', 'días'], default: 'años' })
  @IsOptional()
  @IsEnum(['años', 'meses', 'días'])
  unidadEdad?: 'años' | 'meses' | 'días';

  @ApiProperty({ example: 'F', enum: ['M', 'F', 'OTRO'], description: 'Sexo del paciente' })
  @IsEnum(['M', 'F', 'OTRO'])
  sexo: 'M' | 'F' | 'OTRO';

  @ApiProperty({ example: '2026-10-22', description: 'Fecha de ingreso al servicio hospitalario (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsString()
  fechaIngreso: string;

  @ApiPropertyOptional({ example: 2, description: 'Días transcurridos desde el ingreso' })
  @IsOptional()
  @IsNumber()
  diasHospitalizacion?: number;

  @ApiProperty({
    example: 'Colecistitis aguda litiásica post-colecistectomía',
    description: 'Diagnóstico médico principal de ingreso o evolución',
  })
  @IsNotEmpty()
  @IsString()
  diagnosticoMedicoPrincipal: string;

  @ApiPropertyOptional({
    example: ['Hipertensión arterial estadio 1', 'Diabetes mellitus tipo 2'],
    description: 'Diagnósticos médicos secundarios o antecedentes patológicos',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diagnosticosMedicosSecundarios?: string[];

  @ApiProperty({
    example: ['Penicilina', 'Dipirona / Metamizol'],
    description: 'Alergias conocidas a medicamentos, alimentos o sustancias (Indicar "Ninguna conocida" si no tiene)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  alergias: string[];

  @ApiProperty({
    example: 'Blanda mecánica hiposódica',
    description: 'Tipo de régimen dietético prescrito por el médico',
  })
  @IsNotEmpty()
  @IsString()
  tipoDieta: string;

  @ApiProperty({
    example: 'Posición Semifowler 30° con cambios posturales',
    description: 'Nivel de reposo y postura indicada para el paciente',
  })
  @IsNotEmpty()
  @IsString()
  condicionMovilidad: string;
}

export class BalanceHidricoDto {
  @ApiProperty({ example: true, description: 'Indica si el paciente requiere control de líquidos por turno' })
  @IsBoolean()
  requiereControl: boolean;

  @ApiPropertyOptional({ example: 1500, description: 'Total de líquidos administrados en cc/ml' })
  @IsOptional()
  @IsNumber()
  ingresosCc?: number;

  @ApiPropertyOptional({ example: 1200, description: 'Total de líquidos eliminados (orina, drenajes, vómitos) en cc/ml' })
  @IsOptional()
  @IsNumber()
  egresosCc?: number;

  @ApiPropertyOptional({ example: 300, description: 'Balance hídrico neto acumulado en cc/ml (+ o -)' })
  @IsOptional()
  @IsNumber()
  balanceAcumuladoCc?: number;

  @ApiPropertyOptional({ example: 12, description: 'Período en horas del balance (6, 8, 12 o 24)' })
  @IsOptional()
  @IsNumber()
  periodoHoras?: number;
}

export class DispositivoInvasivoDto {
  @ApiProperty({
    example: 'ViaVenosaPeriferica',
    enum: ['ViaVenosaPeriferica', 'CateterVenosoCentral', 'SondaVesical', 'SondaNasogastrica', 'Drenaje', 'Oxigenoterapia', 'Otro'],
  })
  @IsString()
  tipo: 'ViaVenosaPeriferica' | 'CateterVenosoCentral' | 'SondaVesical' | 'SondaNasogastrica' | 'Drenaje' | 'Oxigenoterapia' | 'Otro';

  @ApiProperty({ example: 'Abocath calibre 18G', description: 'Detalle o descripción del dispositivo' })
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({ example: 'Miembro superior derecho (antebrazo)', description: 'Ubicación anatómica' })
  @IsOptional()
  @IsString()
  calibreOUbicacion?: string;

  @ApiPropertyOptional({ example: '2026-10-22', description: 'Fecha de instalación o última curación' })
  @IsOptional()
  @IsString()
  fechaInstalacion?: string;

  @ApiPropertyOptional({ example: 'Permeable sin signos de flebitis', description: 'Gasto o estado funcional' })
  @IsOptional()
  @IsString()
  debitoOGasto?: string;

  @ApiPropertyOptional({ example: 'Curación limpia y seca', description: 'Notas u observaciones' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class ObjetivoNocDto {
  @ApiPropertyOptional({ example: '1605', description: 'Código taxonómico NOC' })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiProperty({ example: 'Control del dolor', description: 'Resultado esperado según NOC' })
  @IsString()
  resultadoEsperado: string;

  @ApiPropertyOptional({ example: 'EVA <= 3 en 45 minutos', description: 'Indicador clínico específico' })
  @IsOptional()
  @IsString()
  indicador?: string;

  @ApiPropertyOptional({ example: 'Puntaje diana: 4/5', description: 'Escala o puntaje meta' })
  @IsOptional()
  @IsString()
  escalaMeta?: string;
}

export class IntervencionNicDto {
  @ApiPropertyOptional({ example: '2210', description: 'Código taxonómico NIC' })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiProperty({ example: 'Manejo del dolor agudo', description: 'Nombre de la intervención NIC' })
  @IsString()
  intervencion: string;

  @ApiProperty({
    example: [
      'Valorar escala EVA cada 2 horas.',
      'Administrar analgesia prescrita EV.',
      'Posicionar en decúbito lateral con almohada de apoyo abdominal.',
    ],
    description: 'Acciones de enfermería concretas a ejecutar',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  acciones: string[];

  @ApiPropertyOptional({ example: 'Todos', enum: ['Mañana', 'Tarde', 'Noche', 'Todos'] })
  @IsOptional()
  @IsEnum(['Mañana', 'Tarde', 'Noche', 'Todos'])
  turno?: 'Mañana' | 'Tarde' | 'Noche' | 'Todos';
}

export class DiagnosticoEnfermeriaDto {
  @ApiProperty({ example: '00132', description: 'Código NANDA' })
  @IsString()
  codigoNanda: string;

  @ApiProperty({ example: 'Dolor agudo', description: 'Etiqueta diagnóstica NANDA' })
  @IsString()
  etiquetaDiagnostica: string;

  @ApiPropertyOptional({ example: 'Dominio 12: Confort', description: 'Dominio taxonómico NANDA' })
  @IsOptional()
  @IsString()
  dominio?: string;

  @ApiPropertyOptional({ example: 'Clase 1: Confort físico', description: 'Clase taxonómica NANDA' })
  @IsOptional()
  @IsString()
  clase?: string;

  @ApiProperty({ example: 'Real', enum: ['Real', 'Riesgo', 'Salud / Bienestar'] })
  @IsEnum(['Real', 'Riesgo', 'Salud / Bienestar'])
  tipo: 'Real' | 'Riesgo' | 'Salud / Bienestar';

  @ApiProperty({ example: 'Alta', enum: ['Alta', 'Media', 'Baja'] })
  @IsEnum(['Alta', 'Media', 'Baja'])
  prioridad: 'Alta' | 'Media' | 'Baja';

  @ApiProperty({
    example: ['Procedimiento quirúrgico abdominal reciente', 'Herida quirúrgica'],
    description: 'Factores relacionados (r/c - etiología del problema)',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  factoresRelacionados: string[];

  @ApiPropertyOptional({
    example: ['Escala EVA 7/10', 'Facies álgica', 'Taquicardia reactiva'],
    description: 'Características definitorias (m/p - signos y síntomas)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  caracteristicasDefinitorias?: string[];

  @ApiPropertyOptional({
    example: 'Dolor agudo r/c procedimiento quirúrgico abdominal m/p reporte verbal EVA 7/10 y expresión facial álgica',
    description: 'Enunciado diagnóstico PES completo según estándar PAE de Venezuela',
  })
  @IsOptional()
  @IsString()
  enunciadoDiagnostico?: string;

  @ApiPropertyOptional({ type: () => [ObjetivoNocDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ObjetivoNocDto)
  objetivosNoc?: ObjetivoNocDto[];

  @ApiPropertyOptional({ type: () => [IntervencionNicDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IntervencionNicDto)
  intervencionesNic?: IntervencionNicDto[];

  @ApiPropertyOptional({
    example: 'En proceso',
    enum: ['En proceso', 'Alcanzado', 'Parcialmente alcanzado', 'No alcanzado'],
  })
  @IsOptional()
  @IsString()
  estadoEvaluacion?: 'En proceso' | 'Alcanzado' | 'Parcialmente alcanzado' | 'No alcanzado';
}

export class DistribucionTurnosDto {
  @ApiProperty({ example: true, description: 'Administrar en el turno de la Mañana (07:00 a 13:00)' })
  @IsBoolean()
  manana: boolean;

  @ApiProperty({ example: false, description: 'Administrar en el turno de la Tarde (13:00 a 19:00)' })
  @IsBoolean()
  tarde: boolean;

  @ApiProperty({ example: true, description: 'Administrar en el turno de la Noche (19:00 a 07:00)' })
  @IsBoolean()
  noche: boolean;
}

export class MedicamentoKardexDto {
  @ApiProperty({ example: 'Ceftriaxona', description: 'Nombre o principio activo del medicamento' })
  @IsNotEmpty()
  @IsString()
  medicamento: string;

  @ApiPropertyOptional({ example: 'Polvo liofilizado 1 g', description: 'Presentación farmacéutica' })
  @IsOptional()
  @IsString()
  presentacion?: string;

  @ApiProperty({ example: '1 g', description: 'Dosis prescrita' })
  @IsNotEmpty()
  @IsString()
  dosis: string;

  @ApiProperty({
    example: 'EV',
    enum: ['EV', 'IM', 'VO', 'SC', 'SL', 'Inhalatoria', 'Topica', 'Oftalmica', 'Otica', 'Rectal'],
    description: 'Vía de administración',
  })
  @IsString()
  via: 'EV' | 'IM' | 'VO' | 'SC' | 'SL' | 'Inhalatoria' | 'Topica' | 'Oftalmica' | 'Otica' | 'Rectal';

  @ApiProperty({ example: 'c/12h', description: 'Frecuencia de administración' })
  @IsNotEmpty()
  @IsString()
  frecuencia: string;

  @ApiPropertyOptional({
    example: ['07:00', '19:00'],
    description: 'Horarios específicos de administración en el turno',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  horarios?: string[];

  @ApiPropertyOptional({ type: () => DistribucionTurnosDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DistribucionTurnosDto)
  distribucionTurnos?: DistribucionTurnosDto;

  @ApiPropertyOptional({
    example: 'Diluir en 100 cc de Solución 0.9% y pasar en 30 minutos',
    description: 'Recomendaciones de enfermería para la dilución o infusión',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ example: '2026-10-22', description: 'Fecha de inicio del tratamiento' })
  @IsOptional()
  @IsString()
  fechaInicio?: string;
}

export class NotaSoapieDto {
  @ApiProperty({
    example: 'Paciente refiere dolor punzante en herida quirúrgica que califica 7/10 en escala EVA.',
    description: 'S - Subjetivo: Manifestaciones y quejas referidas por el paciente o familiar',
  })
  @IsNotEmpty()
  @IsString()
  subjetivo: string;

  @ApiProperty({
    example: 'Afebril (36.8°C), TA: 120/80 mmHg, FC: 84 lpm, FR: 18 rpm, SpO2: 97%. Abdomen blando con apósito limpio y seco en sitio quirúrgico. Vía periférica permeable en MSD.',
    description: 'O - Objetivo: Signos vitales y examen físico observado por enfermería',
  })
  @IsNotEmpty()
  @IsString()
  objetivo: string;

  @ApiProperty({
    example: 'Dolor agudo r/c lesión tisular por incisión quirúrgica m/p informe verbal EVA 7/10.',
    description: 'A - Análisis / Apreciación: Diagnóstico de enfermería principal',
  })
  @IsNotEmpty()
  @IsString()
  analisis: string;

  @ApiProperty({
    example: 'Alivio del dolor a nivel EVA <= 3/10 y mantenimiento de la estabilidad hemodinámica en el turno.',
    description: 'P - Planificación: Objetivos y metas de cuidado trazados',
  })
  @IsNotEmpty()
  @IsString()
  planificacion: string;

  @ApiProperty({
    example: 'Se administra Ketoprofeno 100 mg EV diluido según orden médica. Se coloca al paciente en posición de Semifowler y se brindan medidas de confort.',
    description: 'I - Intervención: Cuidados de enfermería ejecutados durante la guardia',
  })
  @IsNotEmpty()
  @IsString()
  intervencion: string;

  @ApiProperty({
    example: 'Paciente refiere mejoría progresiva del dolor a 2/10 en EVA a los 45 minutos de la medicación. Descansa tranquilo en su unidad.',
    description: 'E - Evaluación: Respuesta y efectividad de las acciones realizadas',
  })
  @IsNotEmpty()
  @IsString()
  evaluacion: string;
}

export class ResponsableEnfermeriaDto {
  @ApiProperty({ example: 'Lcda. Carmen Mendoza', description: 'Nombre completo del profesional de enfermería' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ example: 'Licenciada en Enfermería', description: 'Título o cargo profesional' })
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiPropertyOptional({ example: 'MPPS-94821', description: 'Matrícula profesional del Ministerio del Poder Popular para la Salud' })
  @IsOptional()
  @IsString()
  matriculaMpps?: string;

  @ApiPropertyOptional({ example: 'Colegio de Profesionales de Enfermería del Dto. Capital', description: 'Colegio profesional' })
  @IsOptional()
  @IsString()
  colegioEnfermeros?: string;

  @ApiPropertyOptional({ example: 'Mañana', enum: ['Mañana', 'Tarde', 'Noche', 'Todos'] })
  @IsOptional()
  @IsEnum(['Mañana', 'Tarde', 'Noche', 'Todos'])
  turno?: 'Mañana' | 'Tarde' | 'Noche' | 'Todos';
}

export class CrearKardexDto {
  @ApiProperty({
    example: 'Hospital Universitario de Caracas',
    description: 'Nombre del hospital, clínica o centro asistencial venezolano',
  })
  @IsNotEmpty()
  @IsString()
  institucion: string;

  @ApiPropertyOptional({
    example: 'República Bolivariana de Venezuela - MPPS',
    description: 'Membrete ministerial o institucional de Venezuela',
    default: 'República Bolivariana de Venezuela - Ministerio del Poder Popular para la Salud (MPPS)',
  })
  @IsOptional()
  @IsString()
  ministerioSalud?: string;

  @ApiProperty({ example: 'Cirugía General', description: 'Servicio clínico o especialidad' })
  @IsNotEmpty()
  @IsString()
  servicio: string;

  @ApiProperty({ example: 'Cama 12-A', description: 'Número de cama o cubículo asignado al paciente' })
  @IsNotEmpty()
  @IsString()
  cama: string;

  @ApiPropertyOptional({ example: 'Pabellón B - Piso 3', description: 'Sala, ala o piso de hospitalización' })
  @IsOptional()
  @IsString()
  sala?: string;

  @ApiProperty({ type: () => PacienteKardexDto, description: 'Información demográfica y clínica del paciente' })
  @ValidateNested()
  @Type(() => PacienteKardexDto)
  paciente: PacienteKardexDto;

  @ApiProperty({ type: () => SignosVitalesInputDto, description: 'Constantes vitales del paciente' })
  @ValidateNested()
  @Type(() => SignosVitalesInputDto)
  signosVitales: SignosVitalesInputDto;

  @ApiPropertyOptional({ type: () => BalanceHidricoDto, description: 'Balance hídrico del paciente' })
  @IsOptional()
  @ValidateNested()
  @Type(() => BalanceHidricoDto)
  balanceHidrico?: BalanceHidricoDto;

  @ApiPropertyOptional({
    type: () => [DispositivoInvasivoDto],
    description: 'Vías venosas, sondas, drenajes u oxigenoterapia activos',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DispositivoInvasivoDto)
  dispositivosInvasivos?: DispositivoInvasivoDto[];

  @ApiPropertyOptional({
    type: () => [DiagnosticoEnfermeriaDto],
    description: 'Diagnósticos de enfermería (PAE / NANDA). Si se omiten, el sistema los infiere automáticamente a partir de los parámetros clínicos.',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DiagnosticoEnfermeriaDto)
  diagnosticosEnfermeria?: DiagnosticoEnfermeriaDto[];

  @ApiPropertyOptional({
    type: () => [MedicamentoKardexDto],
    description: 'Tratamiento farmacológico vigente por turnos hospitalarios',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MedicamentoKardexDto)
  medicamentos?: MedicamentoKardexDto[];

  @ApiPropertyOptional({
    example: ['Control de signos vitales cada 4 horas', 'Curación diaria de herida quirúrgica'],
    description: 'Cuidados especiales programados por el equipo de enfermería',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuidadosEspeciales?: string[];

  @ApiPropertyOptional({
    example: ['Hematología completa y química sanguínea a las 06:00 AM'],
    description: 'Laboratorios pendientes para el siguiente turno',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  laboratoriosPendientes?: string[];

  @ApiPropertyOptional({
    example: ['Ecografía abdominal de control a las 10:00 AM'],
    description: 'Estudios de imagen o procedimientos especiales pendientes',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  estudiosPendientes?: string[];

  @ApiPropertyOptional({
    example: ['Interconsulta con Nutrición y Dietética'],
    description: 'Interconsultas médicas pendientes',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interconsultasPendientes?: string[];

  @ApiPropertyOptional({
    example: ['Vigilar débito de drenaje Penrose', 'Pendiente reporte de cultivo de orina'],
    description: 'Pendientes críticos para el relevo de guardia',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pendientesRelevo?: string[];

  @ApiPropertyOptional({ type: () => NotaSoapieDto, description: 'Nota de relevo o evolución bajo metodología SOAPIE' })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotaSoapieDto)
  notaSOGuardia?: NotaSoapieDto;

  @ApiPropertyOptional({ type: () => ResponsableEnfermeriaDto, description: 'Datos del profesional de enfermería responsable' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResponsableEnfermeriaDto)
  responsable?: ResponsableEnfermeriaDto;
}
