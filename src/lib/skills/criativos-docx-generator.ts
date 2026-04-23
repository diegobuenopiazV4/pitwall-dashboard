/**
 * Gera DOCX no template V4 Company para criativos de anuncios.
 * Usa lib `docx` (ja esta no bundle para Checkin).
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  ShadingType,
  HeadingLevel,
  PageOrientation,
} from 'docx';

interface Criativo {
  num: number;
  headline: string;
  subheadline: string;
  texto: string;
  cta: string;
  titulo: string;
}

interface Props {
  clientName: string;
  criativos: Criativo[];
  agencyName: string;
}

const V4_RED = 'e4243d';
const V4_WHITE = 'ffffff';
const V4_DARK = '1a1a1a';
const V4_LIGHT = 'f5f5f5';

function labelCell(label: string): TableCell {
  return new TableCell({
    width: { size: 30, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: V4_RED, color: 'auto' },
    children: [
      new Paragraph({
        children: [new TextRun({ text: label, bold: true, color: V4_WHITE, font: 'Montserrat', size: 22 })],
        alignment: AlignmentType.LEFT,
      }),
    ],
  });
}

function valueCell(value: string): TableCell {
  return new TableCell({
    width: { size: 70, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: V4_WHITE, color: 'auto' },
    children: [
      new Paragraph({
        children: [new TextRun({ text: value || '-', font: 'Open Sans', size: 22, color: V4_DARK })],
      }),
    ],
  });
}

function criativoTable(c: Criativo): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: V4_RED },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: V4_RED },
      left: { style: BorderStyle.SINGLE, size: 4, color: V4_RED },
      right: { style: BorderStyle.SINGLE, size: 4, color: V4_RED },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'dddddd' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'dddddd' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            shading: { type: ShadingType.CLEAR, fill: V4_DARK, color: 'auto' },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `CRIATIVO ${String(c.num).padStart(2, '0')}`,
                    bold: true,
                    color: V4_RED,
                    font: 'Montserrat',
                    size: 28,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
      new TableRow({ children: [labelCell('HEADLINE'), valueCell(c.headline)] }),
      new TableRow({ children: [labelCell('SUBHEADLINE'), valueCell(c.subheadline)] }),
      new TableRow({ children: [labelCell('TEXTO PRINCIPAL'), valueCell(c.texto)] }),
      new TableRow({ children: [labelCell('CTA'), valueCell(c.cta)] }),
      new TableRow({ children: [labelCell('TITULO DO ANUNCIO'), valueCell(c.titulo)] }),
    ],
  });
}

export async function generateCriativosDocx(p: Props): Promise<Blob> {
  const { clientName, criativos, agencyName } = p;
  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const children: any[] = [
    // Header
    new Paragraph({
      children: [
        new TextRun({ text: 'V4 PIT WALL', bold: true, color: V4_RED, font: 'Montserrat', size: 32 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: agencyName.toUpperCase(), color: '666666', font: 'Open Sans', size: 18, characterSpacing: 200 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'CRIATIVOS', bold: true, color: V4_DARK, font: 'Montserrat', size: 56, characterSpacing: 100 }),
      ],
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: clientName, bold: true, color: V4_RED, font: 'Montserrat', size: 40 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: date, color: '888888', font: 'Open Sans', size: 20, italics: true }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
  ];

  // Cada criativo em sua tabela
  criativos.forEach((c, i) => {
    children.push(criativoTable(c));
    if (i < criativos.length - 1) {
      children.push(new Paragraph({ text: '', spacing: { after: 300 } }));
    }
  });

  // Footer
  children.push(
    new Paragraph({ text: '', spacing: { after: 600 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Documento gerado em ${date} pelo V4 PIT WALL \u2022 ${criativos.length} criativo(s)`,
          color: '888888',
          font: 'Open Sans',
          size: 16,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  const doc = new Document({
    creator: 'V4 PIT WALL',
    title: `Criativos ${clientName}`,
    description: `Documento de criativos gerado pelo V4 PIT WALL para ${clientName}`,
    styles: {
      default: {
        document: {
          run: { font: 'Open Sans', size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 1000, right: 800, bottom: 1000, left: 800 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
