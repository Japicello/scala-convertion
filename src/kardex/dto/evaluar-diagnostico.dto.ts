import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SignosVitalesInputDto {
  @ApiPropertyOptional({ example: '120/80', description: 'Tensión arterial en mmHg (Sistólica/Diastólica)' })
  @IsOptional()
  @IsString()
  tensionArterial?: string;

  @ApiPropertyOptional({ example: 82, description: 'Frecuencia cardíaca en latidos por minuto (lpm)' })
  @IsOptional()
  @IsNumber()
  frecuenciaCardiaca?: number;

  @ApiPropertyOptional({ example: 18, description: 'Frecuencia respiratoria en respiraciones por minuto (rpm)' })
  @IsOptional()
  @IsNumber()
  frecuenciaRespiratoria?: number;

  @ApiPropertyOptional({ example: 38.4, description: 'Temperatura corporal en grados Celsius (°C)' })
  @IsOptional()
  @IsNumber()
  temperatura?: number;

  @ApiPropertyOptional({ example: 96, description: 'Saturación periférica de oxígeno (SpO2 en %)' })
  @IsOptional()
  @IsNumber()
  saturacionOxigeno?: number;

  @ApiPropertyOptional({ example: 7, description: 'Escala Visual Analógica del dolor (EVA 0 a 10)' })
  @IsOptional()
  @IsNumber()
  escalaDolor?: number;

  @ApiPropertyOptional({ example: 110, description: 'Glicemia capilar en mg/dL' })
  @IsOptional()
  @IsNumber()
  glicemiaCapilar?: number;

  @ApiPropertyOptional({ example: 15, description: 'Escala de coma de Glasgow (3 a 15)' })
  @IsOptional()
  @IsNumber()
  escalaGlasgow?: number;
}

export class EvaluarDiagnosticoDto {
  @ApiProperty({ example: 45, description: 'Edad del paciente' })
  @IsNumber()
  edad: number;

  @ApiProperty({ example: 'F', enum: ['M', 'F', 'OTRO'], description: 'Sexo biológico o género' })
  @IsEnum(['M', 'F', 'OTRO'])
  sexo: 'M' | 'F' | 'OTRO';

  @ApiProperty({
    example: 'Apendicitis aguda flemonosa postoperatoria',
    description: 'Diagnóstico médico principal registrado por el médico tratante',
  })
  @IsString()
  diagnosticoMedico: string;

  @ApiPropertyOptional({
    type: () => SignosVitalesInputDto,
    description: 'Signos vitales tomados al paciente durante la valoración',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SignosVitalesInputDto)
  signosVitales?: SignosVitalesInputDto;

  @ApiPropertyOptional({
    example: ['dolor en fosa ilíaca derecha', 'fiebre de 38.5°C', 'náuseas'],
    description: 'Lista de síntomas, quejas subjetivas o problemas observados por enfermería',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sintomasOProblemas?: string[];

  @ApiPropertyOptional({
    example: ['postoperatorio inmediato día 1', 'reposo absoluto en cama', 'ayuno NVO'],
    description: 'Factores de riesgo, antecedentes o condiciones clínicas relevantes',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  antecedentesOCondiciones?: string[];

  @ApiPropertyOptional({
    example: ['Vía venosa periférica en MSD con Abocath #18', 'Drenaje Penrose'],
    description: 'Dispositivos invasivos instalados en el paciente',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dispositivosPresentes?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si se deben sugerir objetivos NOC e intervenciones NIC personalizadas',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  incluirPlanNicNoc?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si se debe generar un borrador de nota SOAPIE estándar de Venezuela',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  generarBorradorSoapie?: boolean;
}
