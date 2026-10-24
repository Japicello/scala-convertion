import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { KardexService } from './services/kardex.service';
import { EvaluarDiagnosticoDto } from './dto/evaluar-diagnostico.dto';
import { CrearKardexDto } from './dto/crear-kardex.dto';
import { FileSanitizer } from '../common/utils/file-sanitizer.util';

@ApiTags('Kardex de Enfermería')
@Controller('kardex')
export class KardexController {
  constructor(private readonly kardexService: KardexService) {}

  @Post('diagnostico')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Evaluar parámetros clínicos y generar diagnóstico de enfermería (PAE Venezuela)',
    description:
      'Recibe los parámetros clínicos enviados por la APP móvil (edad, sexo, diagnóstico médico, signos vitales, quejas/síntomas y dispositivos) y formula automáticamente los diagnósticos de enfermería estructurados con el estándar PES (Problema NANDA, Etiología r/c, Manifestado por m/p), criterios NOC, intervenciones NIC, detección de alertas críticas y borrador de nota SOAPIE según normativas del MPPS de Venezuela.',
  })
  @ApiBody({ type: EvaluarDiagnosticoDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Diagnósticos de enfermería formulados y alertas clínicas evaluadas exitosamente.',
    schema: {
      example: {
        paciente: {
          edad: 45,
          sexo: 'F',
          diagnosticoMedico: 'Apendicitis aguda postoperatoria',
        },
        signosVitales: {
          tensionArterial: '130/85',
          frecuenciaCardiaca: 98,
          temperatura: 38.4,
          escalaDolor: 7,
        },
        alertasClinicas: [
          {
            parametro: 'Temperatura Corporal',
            valor: '38.4 °C',
            severidad: 'ADVERTENCIA',
            mensaje: 'Febrícula o fiebre moderada (>= 37.8 °C).',
            recomendacion: 'Controlar curva térmica cada 2 horas y optimizar ventilación de la unidad.',
          },
          {
            parametro: 'Dolor (Escala EVA)',
            valor: '7/10',
            severidad: 'CRITICA',
            mensaje: 'Dolor agudo de intensidad severa (EVA >= 7).',
            recomendacion: 'Administrar analgesia pautada de rescate y proveer postura antiálgica.',
          },
        ],
        diagnosticosEnfermeria: [
          {
            codigoNanda: '00132',
            etiquetaDiagnostica: 'Dolor agudo',
            tipo: 'Real',
            prioridad: 'Alta',
            enunciadoDiagnostico:
              'Dolor agudo r/c Procedimiento quirúrgico y traumatismo tisular reciente m/p Reporte verbal del paciente en escala EVA 7/10, Facies de dolor y postura antiálgica defensiva.',
          },
          {
            codigoNanda: '00007',
            etiquetaDiagnostica: 'Hipertermia',
            tipo: 'Real',
            prioridad: 'Media',
            enunciadoDiagnostico:
              'Hipertermia r/c Proceso infeccioso activo y respuesta inflamatoria sistémica m/p Temperatura corporal axilar registrada de 38.4°C, Piel caliente y rubicundez facial.',
          },
        ],
        notaSOGuardiaSugerida: {
          subjetivo: 'Paciente refiere dolor en fosa ilíaca derecha con intensidad 7/10 en escala EVA.',
          objetivo: 'Constantes vitales: TA: 130/85 mmHg, FC: 98 lpm, T°: 38.4 °C, EVA: 7/10.',
          analisis: 'Dolor agudo r/c procedimiento quirúrgico m/p EVA 7/10.',
          planificacion: 'Control del dolor y termorregulación adecuada.',
          intervencion: 'Manejo del dolor agudo y medios físicos para la fiebre.',
          evaluacion: 'Paciente tolera cuidados y queda en observación continua.',
        },
        resumenClinico: 'Diagnóstico de enfermería prioritario formulado bajo norma MPPS.',
        normativaAplicada: 'República Bolivariana de Venezuela - MPPS (Taxonomía NANDA-NOC-NIC)',
      },
    },
  })
  evaluarDiagnostico(@Body() dto: EvaluarDiagnosticoDto) {
    return this.kardexService.evaluarDiagnostico(dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Procesar y validar ficha completa de Kárdex de enfermería',
    description:
      'Recibe el objeto de datos del Kárdex enviado desde la APP móvil, normaliza la distribución de medicamentos en los turnos hospitalarios de Venezuela (Mañana, Tarde, Noche), audita alertas de signos vitales, valida la formulación PES de enfermería y devuelve la ficha consolidada bajo el estándar de Venezuela.',
  })
  @ApiBody({ type: CrearKardexDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ficha de Kárdex procesada, validada y estructurada exitosamente.',
  })
  crearFichaKardex(@Body() dto: CrearKardexDto) {
    return this.kardexService.procesarFichaKardex(dto);
  }

  @Post('pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar y descargar documento PDF del Kárdex oficial de enfermería (Venezuela)',
    description:
      'Recibe el objeto de datos del Kárdex enviado desde la APP móvil y genera un documento PDF oficial descargable con membrete del MPPS, grilla de medicamentos por turnos, diagnósticos PAE NANDA/NOC/NIC, constantes vitales y nota SOAPIE listo para imprimir.',
  })
  @ApiBody({ type: CrearKardexDto })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF del Kárdex generado exitosamente en stream binario.',
  })
  async exportarKardexPdf(@Body() dto: CrearKardexDto): Promise<StreamableFile> {
    const result = await this.kardexService.exportarPdf(dto);

    return new StreamableFile(result.buffer, {
      type: 'application/pdf',
      disposition: FileSanitizer.getSafeContentDisposition(result.filename),
      length: result.buffer.length,
    });
  }

  @Get('catalogo')
  @ApiOperation({
    summary: 'Consultar catálogos estandarizados de enfermería de Venezuela',
    description:
      'Retorna el catálogo oficial de diagnósticos PAE frecuentes (NANDA/NOC/NIC), dietas hospitalarias habituales en centros asistenciales venezolanos, vías de administración, condiciones de reposo/movilidad y turnos hospitalarios rotativos.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Catálogos retornados con éxito.',
  })
  obtenerCatalogos() {
    return this.kardexService.obtenerCatalogos();
  }
}
