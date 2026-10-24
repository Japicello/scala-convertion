import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { KardexCalculationResult } from './kardex-inventory.service';

@Injectable()
export class KardexInventoryPdfService {
  async generarPdf(data: KardexCalculationResult): Promise<{ buffer: Buffer; filename: string }> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Color definitions
    const primary = rgb(0 / 255, 102 / 255, 137 / 255);
    const textDark = rgb(30 / 255, 41 / 255, 59 / 255);
    const textMuted = rgb(100 / 255, 116 / 255, 139 / 255);
    const borderGray = rgb(203 / 255, 213 / 255, 225 / 255);
    const rowLight = rgb(248 / 255, 250 / 255, 252 / 255);

    // Header Background Accent Bar
    page.drawRectangle({
      x: 30,
      y: height - 60,
      width: width - 60,
      height: 35,
      color: primary,
    });

    page.drawText('FORMATO 13.1: REGISTRO DE INVENTARIO PERMANENTE VALORIZADO', {
      x: 40,
      y: height - 42,
      size: 13,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText('DETALLE DEL INVENTARIO VALORIZADO - SUNAT / NIIF 2', {
      x: 40,
      y: height - 54,
      size: 8,
      font: fontRegular,
      color: rgb(0.85, 0.95, 1),
    });

    // Company & Info Box
    let yInfo = height - 80;
    page.drawText(`PERÍODO: ${data.periodo}`, { x: 40, y: yInfo, size: 9, font: fontBold, color: textDark });
    page.drawText(`RUC: ${data.ruc}`, { x: 220, y: yInfo, size: 9, font: fontBold, color: textDark });
    page.drawText(`RAZÓN SOCIAL: ${data.empresa}`, { x: 400, y: yInfo, size: 9, font: fontBold, color: textDark });

    yInfo -= 16;
    page.drawText(`MÉTODO DE VALUACIÓN: ${data.metodoValuacion}`, { x: 40, y: yInfo, size: 9, font: fontBold, color: textDark });
    page.drawText(`CÓDIGO EXISTENCIA (SKU): ${data.sku}`, { x: 220, y: yInfo, size: 9, font: fontBold, color: textDark });
    page.drawText(`DESCRIPCIÓN: ${data.descripcionItem}`, { x: 400, y: yInfo, size: 9, font: fontRegular, color: textDark });
    page.drawText(`MONEDA: ${data.moneda}`, { x: 720, y: yInfo, size: 9, font: fontBold, color: textDark });

    // Table Header
    const yTable = height - 120;
    page.drawRectangle({
      x: 30,
      y: yTable - 20,
      width: width - 60,
      height: 20,
      color: rgb(230 / 255, 235 / 255, 245 / 255),
      borderColor: borderGray,
      borderWidth: 1,
    });

    const headers = [
      { text: 'FECHA', x: 35 },
      { text: 'DOCUMENTO', x: 100 },
      { text: 'OPERACIÓN', x: 180 },
      { text: 'ENT. CANT', x: 250 },
      { text: 'ENT. COSTO', x: 310 },
      { text: 'ENT. TOTAL', x: 380 },
      { text: 'SAL. CANT', x: 450 },
      { text: 'SAL. COSTO', x: 510 },
      { text: 'SAL. TOTAL', x: 570 },
      { text: 'SALDO CANT', x: 640 },
      { text: 'COSTO PROM', x: 710 },
      { text: 'SALDO TOTAL', x: 775 },
    ];

    for (const h of headers) {
      page.drawText(h.text, { x: h.x, y: yTable - 14, size: 7.5, font: fontBold, color: textDark });
    }

    // Rows
    let rowY = yTable - 34;
    data.filas.slice(0, 18).forEach((r, idx) => {
      if (idx % 2 === 0) {
        page.drawRectangle({
          x: 30,
          y: rowY - 4,
          width: width - 60,
          height: 14,
          color: rowLight,
        });
      }

      page.drawText(r.fecha, { x: 35, y: rowY, size: 7, font: fontRegular, color: textDark });
      page.drawText(r.documento, { x: 100, y: rowY, size: 7, font: fontRegular, color: textDark });
      page.drawText(r.tipo, { x: 180, y: rowY, size: 7, font: fontRegular, color: textDark });

      page.drawText(r.entradaCant > 0 ? r.entradaCant.toString() : '-', { x: 250, y: rowY, size: 7, font: fontRegular, color: textDark });
      page.drawText(r.entradaCostoU > 0 ? r.entradaCostoU.toFixed(2) : '-', { x: 310, y: rowY, size: 7, font: fontRegular, color: textDark });
      page.drawText(r.entradaTotal > 0 ? r.entradaTotal.toFixed(2) : '-', { x: 380, y: rowY, size: 7, font: fontRegular, color: textDark });

      page.drawText(r.salidaCant > 0 ? r.salidaCant.toString() : '-', { x: 450, y: rowY, size: 7, font: fontRegular, color: textDark });
      page.drawText(r.salidaCostoU > 0 ? r.salidaCostoU.toFixed(2) : '-', { x: 510, y: rowY, size: 7, font: fontRegular, color: textDark });
      page.drawText(r.salidaTotal > 0 ? r.salidaTotal.toFixed(2) : '-', { x: 570, y: rowY, size: 7, font: fontRegular, color: textDark });

      page.drawText(r.saldoCant.toString(), { x: 640, y: rowY, size: 7, font: fontBold, color: textDark });
      page.drawText(r.saldoCostoU.toFixed(2), { x: 710, y: rowY, size: 7, font: fontRegular, color: textDark });
      page.drawText(`$${r.saldoTotal.toFixed(2)}`, { x: 775, y: rowY, size: 7, font: fontBold, color: textDark });

      rowY -= 14;
    });

    // Summary Box at bottom
    const ySummary = 85;
    page.drawRectangle({
      x: 30,
      y: ySummary,
      width: width - 60,
      height: 40,
      color: rgb(240 / 255, 249 / 255, 255 / 255),
      borderColor: primary,
      borderWidth: 1,
    });

    page.drawText(`TOTAL ENTRADAS: ${data.totalEntradasUnidades} un. ($${data.totalEntradasValor.toFixed(2)})`, {
      x: 40,
      y: ySummary + 24,
      size: 8,
      font: fontBold,
      color: textDark,
    });

    page.drawText(`TOTAL SALIDAS: ${data.totalSalidasUnidades} un. ($${data.totalSalidasValor.toFixed(2)})`, {
      x: 300,
      y: ySummary + 24,
      size: 8,
      font: fontBold,
      color: textDark,
    });

    page.drawText(`SALDO FINAL: ${data.saldoFinalUnidades} un. ($${data.saldoFinalValor.toFixed(2)})`, {
      x: 580,
      y: ySummary + 24,
      size: 9,
      font: fontBold,
      color: primary,
    });

    page.drawText(`SELLO CRIPTOGRÁFICO SHA-256: ${data.digitalSignHash}`, {
      x: 40,
      y: ySummary + 8,
      size: 7,
      font: fontRegular,
      color: textMuted,
    });

    // Footer
    page.drawText('Generado por ScalaDocs Enterprise Document Engine v4.2 • Cumplimiento Normativo Oficial SUNAT / NIIF 2', {
      x: 40,
      y: 20,
      size: 7,
      font: fontRegular,
      color: textMuted,
    });

    const pdfBytes = await pdfDoc.save();
    const cleanSku = data.sku.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Kardex_Oficial_${cleanSku}_${data.periodo}.pdf`;

    return {
      buffer: Buffer.from(pdfBytes),
      filename,
    };
  }
}
