import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { IFichaKardexCompleta } from '../interfaces/kardex.interface';

@Injectable()
export class KardexPdfService {
  private readonly logger = new Logger(KardexPdfService.name);

  /**
   * Genera el documento PDF oficial del Kárdex de Enfermería según el formato estándar de Venezuela
   */
  async generarPdfKardex(kardex: IFichaKardexCompleta): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();

    // Tamaño Carta (Letter) en orientación Vertical: 612 x 792 pt
    const pageWidth = 612;
    const pageHeight = 792;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const margin = 36; // 0.5 pulgada
    let y = pageHeight - margin;

    // Paleta de colores institucionales de salud venezolanos
    const colorPrimario = rgb(0.08, 0.28, 0.52); // Azul institucional
    const colorSecundario = rgb(0.2, 0.45, 0.7); // Azul medio
    const colorGrisFondo = rgb(0.95, 0.96, 0.98); // Gris tenue
    const colorGrisBorde = rgb(0.78, 0.82, 0.88);
    const colorTexto = rgb(0.12, 0.14, 0.18);
    const colorAlertaRojo = rgb(0.85, 0.15, 0.15);
    const colorBlanco = rgb(1, 1, 1);

    // Función auxiliar para texto seguro (WinAnsiEncoding en pdf-lib)
    const sanitizeText = (txt: string | number | undefined | null): string => {
      if (txt === undefined || txt === null) return '';
      return String(txt)
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ') // caracteres compatibles con WinAnsi
        .trim();
    };

    // Función para dibujar texto con límite de ancho
    const drawText = (
      p: PDFPage,
      text: string,
      x: number,
      yPos: number,
      size: number,
      font: PDFFont,
      color = colorTexto,
    ) => {
      p.drawText(sanitizeText(text), {
        x,
        y: yPos,
        size,
        font,
        color,
      });
    };

    // 1. ENCABEZADO OFICIAL
    // Barra superior decorativa
    page.drawRectangle({
      x: margin,
      y: y - 5,
      width: pageWidth - margin * 2,
      height: 4,
      color: colorPrimario,
    });
    y -= 18;

    drawText(
      page,
      kardex.ministerioSalud || 'REPÚBLICA BOLIVARIANA DE VENEZUELA - MPPS',
      margin,
      y,
      9,
      fontBold,
      colorPrimario,
    );
    y -= 12;

    const instServ = `${kardex.institucion.toUpperCase()}  |  SERVICIO: ${(kardex.servicio || 'GENERAL').toUpperCase()}  |  CAMA: ${(kardex.cama || 'S/N').toUpperCase()}`;
    drawText(page, instServ, margin, y, 8, fontRegular, colorTexto);
    y -= 14;

    // Título principal
    page.drawRectangle({
      x: margin,
      y: y - 3,
      width: pageWidth - margin * 2,
      height: 20,
      color: colorPrimario,
    });
    drawText(
      page,
      'KÁRDEX DE ENFERMERÍA - PROCESO DE ATENCIÓN DE ENFERMERÍA (PAE)',
      margin + 8,
      y + 3,
      10,
      fontBold,
      colorBlanco,
    );
    y -= 26;

    // 2. SECCIÓN: DATOS DE IDENTIFICACIÓN DEL PACIENTE
    const p = kardex.paciente;
    const boxWidth = pageWidth - margin * 2;
    const boxHeight = 72;

    page.drawRectangle({
      x: margin,
      y: y - boxHeight,
      width: boxWidth,
      height: boxHeight,
      color: colorGrisFondo,
      borderColor: colorGrisBorde,
      borderWidth: 1,
    });

    let rowY = y - 14;
    const col1 = margin + 8;
    const col2 = margin + 200;
    const col3 = margin + 370;

    // Fila 1: Nombres y Apellidos, HCL, C.I.
    drawText(page, `PACIENTE: ${p.apellidos}, ${p.nombres}`, col1, rowY, 8.5, fontBold);
    drawText(page, `HCL: ${p.historiaClinica}`, col2, rowY, 8.5, fontBold);
    drawText(page, `C.I.: ${p.cedulaIdentidad || 'No registrada'}`, col3, rowY, 8.5, fontRegular);
    rowY -= 13;

    // Fila 2: Edad/Sexo, Fecha Ingreso, Cama
    drawText(page, `EDAD: ${p.edad} ${p.unidadEdad || 'años'}  |  SEXO: ${p.sexo}`, col1, rowY, 8, fontRegular);
    drawText(page, `INGRESO: ${p.fechaIngreso}`, col2, rowY, 8, fontRegular);
    drawText(page, `CAMA: ${kardex.cama}`, col3, rowY, 8, fontBold, colorPrimario);
    rowY -= 13;

    // Fila 3: Diagnóstico Médico Principal
    const diagMed = `DIAG. MÉDICO: ${p.diagnosticoMedicoPrincipal}`;
    drawText(page, diagMed.slice(0, 85), col1, rowY, 8, fontBold);
    rowY -= 13;

    // Fila 4: Dieta y Reposo
    drawText(page, `DIETA: ${p.tipoDieta}`, col1, rowY, 7.5, fontRegular);
    drawText(page, `MOVILIDAD: ${p.condicionMovilidad}`, col2, rowY, 7.5, fontRegular);
    rowY -= 13;

    // Alerta de Alergias (Resaltado en rojo estándar venezolano)
    const alergiasTexto =
      p.alergias && p.alergias.length > 0 ? p.alergias.join(', ') : 'Ninguna conocida';
    const alergiaColor =
      alergiasTexto.toLowerCase().includes('ninguna') ? colorTexto : colorAlertaRojo;
    drawText(page, `ALERGIAS: ${alergiasTexto}`, col1, rowY, 8, fontBold, alergiaColor);

    y -= boxHeight + 10;

    // 3. SECCIÓN: SIGNOS VITALES Y MONITOREO CLÍNICO
    const sv = kardex.signosVitales;
    page.drawRectangle({
      x: margin,
      y: y - 24,
      width: boxWidth,
      height: 24,
      color: rgb(0.92, 0.95, 0.98),
      borderColor: colorGrisBorde,
      borderWidth: 1,
    });

    const svTexto = [
      `TA: ${sv.tensionArterial || '--'} mmHg`,
      `FC: ${sv.frecuenciaCardiaca ? sv.frecuenciaCardiaca + ' lpm' : '--'}`,
      `FR: ${sv.frecuenciaRespiratoria ? sv.frecuenciaRespiratoria + ' rpm' : '--'}`,
      `T°: ${sv.temperatura ? sv.temperatura + ' °C' : '--'}`,
      `SpO2: ${sv.saturacionOxigeno ? sv.saturacionOxigeno + '%' : '--'}`,
      `EVA: ${sv.escalaDolor !== undefined ? sv.escalaDolor + '/10' : '--'}`,
      ...(sv.glicemiaCapilar ? [`Glicemia: ${sv.glicemiaCapilar} mg/dL`] : []),
    ].join('   |   ');

    drawText(page, 'SIGNOS VITALES ACTUALES:', margin + 6, y - 10, 7.5, fontBold, colorSecundario);
    drawText(page, svTexto, margin + 6, y - 20, 7.5, fontBold, colorTexto);

    y -= 32;

    // 4. SECCIÓN: PLAN DE MEDICAMENTOS POR TURNOS (MAÑANA, TARDE, NOCHE)
    drawText(page, 'TRATAMIENTO FARMACOLÓGICO Y HORARIOS (TURNOS HOSPITALARIOS VENEZUELA)', margin, y, 8.5, fontBold, colorPrimario);
    y -= 10;

    // Encabezado de la tabla de medicamentos
    const tableHeaderHeight = 14;
    page.drawRectangle({
      x: margin,
      y: y - tableHeaderHeight,
      width: boxWidth,
      height: tableHeaderHeight,
      color: colorSecundario,
    });

    const colMed = margin + 4;
    const colDosis = margin + 175;
    const colVia = margin + 235;
    const colFrec = margin + 275;
    const colManana = margin + 330;
    const colTarde = margin + 375;
    const colNoche = margin + 420;
    const colObs = margin + 465;

    drawText(page, 'MEDICAMENTO / PRESENTACIÓN', colMed, y - 10, 7, fontBold, colorBlanco);
    drawText(page, 'DOSIS', colDosis, y - 10, 7, fontBold, colorBlanco);
    drawText(page, 'VÍA', colVia, y - 10, 7, fontBold, colorBlanco);
    drawText(page, 'FREC.', colFrec, y - 10, 7, fontBold, colorBlanco);
    drawText(page, '07-13 (M)', colManana, y - 10, 6.5, fontBold, colorBlanco);
    drawText(page, '13-19 (T)', colTarde, y - 10, 6.5, fontBold, colorBlanco);
    drawText(page, '19-07 (N)', colNoche, y - 10, 6.5, fontBold, colorBlanco);
    drawText(page, 'OBSERVACIONES', colObs, y - 10, 7, fontBold, colorBlanco);

    y -= tableHeaderHeight;

    const meds = kardex.medicamentos || [];
    const maxMedsToShow = Math.min(meds.length, 6);

    for (let i = 0; i < maxMedsToShow; i++) {
      const m = meds[i];
      const rowH = 14;
      const isEven = i % 2 === 0;

      page.drawRectangle({
        x: margin,
        y: y - rowH,
        width: boxWidth,
        height: rowH,
        color: isEven ? colorBlanco : colorGrisFondo,
        borderColor: colorGrisBorde,
        borderWidth: 0.5,
      });

      const medNombre = m.presentacion ? `${m.medicamento} (${m.presentacion})` : m.medicamento;
      drawText(page, medNombre.slice(0, 32), colMed, y - 10, 6.8, fontBold);
      drawText(page, m.dosis || '--', colDosis, y - 10, 6.8, fontRegular);
      drawText(page, m.via || '--', colVia, y - 10, 6.8, fontRegular);
      drawText(page, m.frecuencia || '--', colFrec, y - 10, 6.8, fontRegular);

      // Marca de verificación por turno
      const dist = m.distribucionTurnos;
      drawText(page, dist?.manana ? '[ X ]' : '[   ]', colManana + 4, y - 10, 6.5, fontBold, dist?.manana ? colorPrimario : colorTexto);
      drawText(page, dist?.tarde ? '[ X ]' : '[   ]', colTarde + 4, y - 10, 6.5, fontBold, dist?.tarde ? colorPrimario : colorTexto);
      drawText(page, dist?.noche ? '[ X ]' : '[   ]', colNoche + 4, y - 10, 6.5, fontBold, dist?.noche ? colorPrimario : colorTexto);

      const obs = (m.observaciones || (m.horarios?.length ? `Hrs: ${m.horarios.join(', ')}` : '')).slice(0, 22);
      drawText(page, obs, colObs, y - 10, 6.5, fontRegular);

      y -= rowH;
    }

    if (meds.length === 0) {
      const rowH = 14;
      page.drawRectangle({
        x: margin,
        y: y - rowH,
        width: boxWidth,
        height: rowH,
        color: colorBlanco,
        borderColor: colorGrisBorde,
        borderWidth: 0.5,
      });
      drawText(page, 'No se registraron medicamentos activos en este turno.', colMed, y - 10, 7, fontOblique);
      y -= rowH;
    }

    y -= 10;

    // 5. SECCIÓN: DIAGNÓSTICOS DE ENFERMERÍA (PAE / PES)
    drawText(page, 'DIAGNÓSTICOS DE ENFERMERÍA (PAE - TAXONOMÍA NANDA / NOC / NIC)', margin, y, 8.5, fontBold, colorPrimario);
    y -= 10;

    const diags = kardex.diagnosticosEnfermeria || [];
    const maxDiags = Math.min(diags.length, 3);

    for (let i = 0; i < maxDiags; i++) {
      const d = diags[i];
      const cardHeight = 38;

      page.drawRectangle({
        x: margin,
        y: y - cardHeight,
        width: boxWidth,
        height: cardHeight,
        color: colorGrisFondo,
        borderColor: colorGrisBorde,
        borderWidth: 0.8,
      });

      // Cabecera diagnóstico
      const diagTitle = `[${d.codigoNanda}] ${d.etiquetaDiagnostica.toUpperCase()} (${d.tipo.toUpperCase()}) - PRIORIDAD: ${d.prioridad.toUpperCase()}`;
      drawText(page, diagTitle, margin + 6, y - 9, 7.5, fontBold, colorPrimario);

      // Enunciado PES
      const pesText = `PES: ${d.enunciadoDiagnostico || `${d.etiquetaDiagnostica} r/c ${d.factoresRelacionados.join(', ')}`}`;
      drawText(page, pesText.slice(0, 115), margin + 6, y - 19, 6.8, fontRegular);

      // NOC y NIC resumidos
      const noc = d.objetivosNoc?.[0]?.resultadoEsperado || 'Bienestar general';
      const nic = d.intervencionesNic?.[0]?.intervencion || 'Cuidados de enfermería';
      const planResumen = `NOC: ${noc}   |   NIC: ${nic}`;
      drawText(page, planResumen.slice(0, 115), margin + 6, y - 29, 6.8, fontOblique, colorSecundario);

      y -= cardHeight + 4;
    }

    if (diags.length === 0) {
      drawText(page, 'Sin diagnósticos de enfermería registrados.', margin + 6, y - 10, 7.5, fontOblique);
      y -= 16;
    }

    y -= 6;

    // 6. SECCIÓN: CUIDADOS ESPECIALES, DISPOSITIVOS Y PENDIENTES
    const dispBoxHeight = 36;
    page.drawRectangle({
      x: margin,
      y: y - dispBoxHeight,
      width: boxWidth,
      height: dispBoxHeight,
      color: colorBlanco,
      borderColor: colorGrisBorde,
      borderWidth: 1,
    });

    drawText(page, 'DISPOSITIVOS INVASIVOS Y CUIDADOS ESPECIALES:', margin + 6, y - 9, 7.5, fontBold, colorSecundario);

    const dispText =
      kardex.dispositivosInvasivos && kardex.dispositivosInvasivos.length > 0
        ? kardex.dispositivosInvasivos.map((di) => `${di.tipo}: ${di.descripcion}`).join('  |  ')
        : 'Sin dispositivos invasivos activos';
    drawText(page, dispText.slice(0, 115), margin + 6, y - 19, 6.8, fontRegular);

    const pendientes = [
      ...(kardex.cuidadosEspeciales || []),
      ...(kardex.pendientesRelevo || []),
      ...(kardex.laboratoriosPendientes?.map((l) => `Lab: ${l}`) || []),
    ].join('  |  ');
    const pendText = `PENDIENTES RELEVO: ${pendientes || 'Ninguno registrado para el turno'}`;
    drawText(page, pendText.slice(0, 115), margin + 6, y - 29, 6.8, fontBold, colorAlertaRojo);

    y -= dispBoxHeight + 10;

    // 7. SECCIÓN: NOTA DE EVOLUCIÓN BAJO MÉTODO SOAPIE (ESTÁNDAR VENEZUELA)
    drawText(page, 'REGISTRO DE EVOLUCIÓN Y RELEVO DE GUARDIA (MÉTODO SOAPIE VENEZOLANO)', margin, y, 8.5, fontBold, colorPrimario);
    y -= 10;

    const soapieHeight = 65;
    page.drawRectangle({
      x: margin,
      y: y - soapieHeight,
      width: boxWidth,
      height: soapieHeight,
      color: colorGrisFondo,
      borderColor: colorGrisBorde,
      borderWidth: 1,
    });

    const soap = kardex.notaSOGuardia;
    let soapY = y - 9;

    drawText(page, `S (Subjetivo): ${(soap?.subjetivo || 'Sin datos').slice(0, 115)}`, margin + 6, soapY, 6.5, fontRegular);
    soapY -= 9;
    drawText(page, `O (Objetivo): ${(soap?.objetivo || 'Sin datos').slice(0, 115)}`, margin + 6, soapY, 6.5, fontRegular);
    soapY -= 9;
    drawText(page, `A (Análisis): ${(soap?.analisis || 'Sin datos').slice(0, 115)}`, margin + 6, soapY, 6.5, fontRegular);
    soapY -= 9;
    drawText(page, `P (Plan): ${(soap?.planificacion || 'Sin datos').slice(0, 115)}`, margin + 6, soapY, 6.5, fontRegular);
    soapY -= 9;
    drawText(page, `I (Intervención): ${(soap?.intervencion || 'Sin datos').slice(0, 115)}`, margin + 6, soapY, 6.5, fontRegular);
    soapY -= 9;
    drawText(page, `E (Evaluación): ${(soap?.evaluacion || 'Sin datos').slice(0, 115)}`, margin + 6, soapY, 6.5, fontRegular);

    y -= soapieHeight + 12;

    // 8. PIE DE PÁGINA Y FIRMA DEL PROFESIONAL DE ENFERMERÍA
    const resp = kardex.responsable;
    const respTexto = `RESPONSABLE: ${resp?.nombre || 'Enfermero(a) de Guardia'}  |  ${resp?.cargo || 'Lic. en Enfermería'}  |  MATRÍCULA MPPS: ${resp?.matriculaMpps || 'S/N'}  |  TURNO: ${resp?.turno || 'Guardia'}`;
    drawText(page, respTexto, margin, y, 7.5, fontBold, colorTexto);

    // Línea de firma
    page.drawLine({
      start: { x: pageWidth - margin - 150, y: y + 2 },
      end: { x: pageWidth - margin, y: y + 2 },
      thickness: 0.8,
      color: colorTexto,
    });
    drawText(page, 'Firma y Sello del Profesional', pageWidth - margin - 135, y - 8, 6.5, fontRegular);

    // Fecha y pie de página legal
    drawText(
      page,
      `Fecha de emisión: ${kardex.fechaRegistro || new Date().toISOString().slice(0, 10)} - Documento clínico asistencial del Sistema Público Nacional de Salud (Venezuela)`,
      margin,
      margin - 10,
      6.5,
      fontOblique,
      rgb(0.4, 0.4, 0.4),
    );

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
