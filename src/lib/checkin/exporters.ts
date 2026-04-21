/**
 * Exporters do Check-in em multiplos formatos:
 * - HTML (premium Claude Design, glassmorphism)
 * - PDF (via browser print)
 * - DOCX (Word profissional)
 * - Google Docs (upload do DOCX para Drive automaticamente)
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
} from 'docx';
import { safeFilename } from '../documents/exporters';

export type CheckinFormat = 'html' | 'pdf' | 'docx' | 'gdocs';

interface ExportCheckinOpts {
  html: string;
  clientName: string;
  type: 'weekly' | 'monthly';
  period?: string;
}

/**
 * Export HTML (ja gerado pelo Claude Design) - download direto.
 */
export function exportCheckinHTML({ html, clientName, type, period }: ExportCheckinOpts): void {
  const filename = safeFilename(`checkin-${type}-${clientName}-${period ?? new Date().toISOString().slice(0, 10)}`);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export PDF via window.print().
 * Abre o HTML num iframe com @media print CSS, dispara print dialog.
 * Usuario escolhe "Save as PDF" no dialog nativo do browser.
 */
export function exportCheckinPDF({ html, clientName, type, period }: ExportCheckinOpts): void {
  const title = `Check-in ${type === 'weekly' ? 'Semanal' : 'Mensal'} - ${clientName} - ${period ?? ''}`.trim();

  // Inject print-friendly CSS
  const printCSS = `
    @media print {
      @page { size: A4 landscape; margin: 0.5cm; }
      body { background: white !important; color: #000 !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .slide, section { page-break-after: always; page-break-inside: avoid; min-height: 100vh; padding: 2cm; }
      nav, .nav, .dots, button { display: none !important; }
    }
  `;

  // Modificar HTML para incluir print CSS
  const enhancedHtml = html.includes('</head>')
    ? html.replace('</head>', `<style>${printCSS}</style></head>`)
    : html.replace('<body', `<style>${printCSS}</style><body`);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Permita popups para exportar como PDF');
  }

  printWindow.document.open();
  printWindow.document.write(enhancedHtml);
  printWindow.document.close();
  printWindow.document.title = title;

  // Trigger print quando a pagina estiver totalmente carregada
  printWindow.addEventListener('load', () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  });
}

/**
 * Parse HTML para extrair texto estruturado (headings, paragrafos, listas, tabelas).
 * Usado para DOCX/Google Docs.
 */
interface ParsedContent {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'section-break';
  level?: number;
  text?: string;
  items?: string[];
  rows?: string[][];
}

function parseHtmlContent(html: string, clientName: string, type: string): ParsedContent[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const content: ParsedContent[] = [];

  // Titulo principal
  content.push({
    type: 'heading',
    level: 1,
    text: `Check-in ${type === 'weekly' ? 'Semanal' : 'Mensal'} - ${clientName}`,
  });

  // Pega todas as secoes/slides
  const sections = doc.querySelectorAll('section, .slide, [class*="slide"]');
  const elements = sections.length > 0 ? Array.from(sections) : [doc.body];

  elements.forEach((section, idx) => {
    if (idx > 0) content.push({ type: 'section-break' });

    // Extrair h1/h2/h3
    section.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
      content.push({
        type: 'heading',
        level: Math.min(parseInt(h.tagName[1]) + 1, 4),
        text: h.textContent?.trim() ?? '',
      });
    });

    // Paragrafos
    section.querySelectorAll('p').forEach((p) => {
      const text = p.textContent?.trim();
      if (text && text.length > 2) {
        content.push({ type: 'paragraph', text });
      }
    });

    // Listas
    section.querySelectorAll('ul, ol').forEach((list) => {
      const items = Array.from(list.querySelectorAll('li'))
        .map((li) => li.textContent?.trim() ?? '')
        .filter(Boolean);
      if (items.length > 0) {
        content.push({ type: 'list', items });
      }
    });

    // Tabelas
    section.querySelectorAll('table').forEach((table) => {
      const rows: string[][] = [];
      table.querySelectorAll('tr').forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll('th, td')).map((cell) => cell.textContent?.trim() ?? '');
        if (cells.length > 0) rows.push(cells);
      });
      if (rows.length > 0) {
        content.push({ type: 'table', rows });
      }
    });

    // Divs com texto (KPIs, insights) — fallback
    if (!section.querySelector('p, h1, h2, h3, ul, ol, table')) {
      section.querySelectorAll('div, span').forEach((div) => {
        const text = div.textContent?.trim();
        if (text && text.length > 20 && text.length < 500 && !div.querySelector('div, span')) {
          content.push({ type: 'paragraph', text });
        }
      });
    }
  });

  return content;
}

/**
 * Export DOCX (Word) - formata o conteudo como documento profissional.
 */
export async function exportCheckinDOCX({ html, clientName, type, period }: ExportCheckinOpts): Promise<Blob> {
  const parsed = parseHtmlContent(html, clientName, type);

  const children = parsed.map((item): Paragraph | Table => {
    if (item.type === 'heading') {
      const level = (item.level ?? 1) as 1 | 2 | 3 | 4 | 5 | 6;
      return new Paragraph({
        text: item.text ?? '',
        heading: `Heading${level}` as keyof typeof HeadingLevel as any,
        spacing: { before: 240, after: 120 },
      });
    }

    if (item.type === 'paragraph') {
      return new Paragraph({
        children: [new TextRun({ text: item.text ?? '', size: 22 })],
        spacing: { before: 120, after: 120 },
      });
    }

    if (item.type === 'list' && item.items) {
      // Lista vira multiplos paragrafos com bullets
      return new Paragraph({
        children: item.items.map((it, i) => new TextRun({ text: (i > 0 ? '\n' : '') + `• ${it}`, size: 22, break: i > 0 ? 1 : 0 })),
        spacing: { before: 120, after: 120 },
      });
    }

    if (item.type === 'table' && item.rows && item.rows.length > 0) {
      const headerRow = item.rows[0];
      const bodyRows = item.rows.slice(1);

      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: headerRow.map(
              (text) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20 })] })],
                  shading: { type: ShadingType.SOLID, color: 'E63946', fill: 'E63946' },
                })
            ),
          }),
          ...bodyRows.map(
            (row) =>
              new TableRow({
                children: row.map(
                  (text) =>
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text, size: 20 })] })],
                    })
                ),
              })
          ),
        ],
      });
    }

    // section-break ou desconhecido
    return new Paragraph({
      children: [new TextRun({ text: '', break: 1 })],
      pageBreakBefore: item.type === 'section-break',
    });
  });

  const doc = new Document({
    title: `Check-in ${type} ${clientName}`,
    creator: 'V4 PIT WALL',
    description: `Check-in ${type === 'weekly' ? 'semanal' : 'mensal'} gerado pelo sistema V4/Ruston`,
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          run: { size: 36, bold: true, color: 'E63946', font: 'Calibri' },
          paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.LEFT },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          run: { size: 28, bold: true, color: '1A1A24', font: 'Calibri' },
          paragraph: { spacing: { before: 200, after: 100 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          run: { size: 24, bold: true, color: '333333', font: 'Calibri' },
          paragraph: { spacing: { before: 160, after: 80 } },
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: [
          // Header do documento
          new Paragraph({
            children: [
              new TextRun({ text: 'V4 PIT WALL', bold: true, size: 28, color: 'E63946' }),
              new TextRun({ text: ' · ', size: 20, color: '888888' }),
              new TextRun({ text: `Check-in ${type === 'weekly' ? 'Semanal' : 'Mensal'}`, size: 24 }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Cliente: ${clientName}`, size: 22 }),
              new TextRun({ text: '  ·  ', color: '888888', size: 20 }),
              new TextRun({ text: `Periodo: ${period ?? new Date().toLocaleDateString('pt-BR')}`, size: 22 }),
            ],
            spacing: { after: 400 },
            border: {
              bottom: { color: 'E63946', space: 4, style: BorderStyle.SINGLE, size: 12 },
            },
          }),
          ...(children as (Paragraph | Table)[]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Download DOCX.
 */
export async function downloadCheckinDOCX(opts: ExportCheckinOpts): Promise<void> {
  const blob = await exportCheckinDOCX(opts);
  const filename = safeFilename(`checkin-${opts.type}-${opts.clientName}-${opts.period ?? new Date().toISOString().slice(0, 10)}`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export para Google Docs:
 * 1. Gera DOCX
 * 2. Baixa o arquivo
 * 3. Abre o Google Drive upload em nova aba
 * 4. Orienta o usuario a arrastar o arquivo (que sera convertido automaticamente pelo Google)
 */
export async function exportCheckinGoogleDocs(opts: ExportCheckinOpts): Promise<void> {
  // Primeiro, gera e baixa o DOCX
  await downloadCheckinDOCX(opts);

  // Abre Google Drive upload page
  setTimeout(() => {
    window.open('https://drive.google.com/drive/my-drive', '_blank');
  }, 500);
}
