import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} from 'docx';

function headerCell(text) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20, font: 'Arial' })],
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: { fill: '2563EB' },
    width: { size: 25, type: WidthType.PERCENTAGE },
  });
}

function dataCell(text) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: text || '—', size: 18, font: 'Arial' })],
      }),
    ],
    width: { size: 25, type: WidthType.PERCENTAGE },
  });
}

export function gerarRelatorioSemanal(aulas, startDate, endDate) {
  const headerRow = new TableRow({
    children: [
      headerCell('Aluno'),
      headerCell('Data'),
      headerCell('Conteúdo Ministrado'),
      headerCell('Lição de Casa'),
    ],
    tableHeader: true,
  });

  const dataRows = aulas.map(
    (a) =>
      new TableRow({
        children: [
          dataCell(a.profiles?.nome || a.student_name),
          dataCell(new Date(a.data_aula).toLocaleDateString('pt-BR')),
          dataCell(a.conteudo_ensinado),
          dataCell(a.teve_tarefa ? a.descricao_tarefa || 'Sim' : 'Não'),
        ],
      })
  );

  const table = new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
  });

  return new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Relatório Semanal de Aulas',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`,
                size: 20,
                font: 'Arial',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Total de aulas: ${aulas.length}`,
                size: 20,
                font: 'Arial',
              }),
            ],
            spacing: { after: 200 },
          }),
          table,
        ],
      },
    ],
  });
}
