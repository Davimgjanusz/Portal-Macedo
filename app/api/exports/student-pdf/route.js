import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { createClient } from '@/lib/supabase/server';
import { Packer, Document, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
=======
import PDFDocument from 'pdfkit';
import { createClient } from '@/lib/supabase/server';
import { formatarIntervalo } from '@/lib/horarios';

const COLUNAS = [
  { titulo: 'Data', largura: 70 },
  { titulo: 'Horário', largura: 78 },
  { titulo: 'Modalidade', largura: 68 },
  { titulo: 'Conteúdo', largura: 0 },
  { titulo: 'Valor', largura: 62 },
  { titulo: 'Status', largura: 58 },
];

function gerarPdf(conteudo) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    conteudo(doc);
    doc.end();
  });
}

function desenharCabecalhoTabela(doc, y, larguraUtil, colunas) {
  doc.fontSize(9).fillColor('#FFFFFF');
  doc.rect(40, y, larguraUtil, 20).fill('#1E3A8A');
  let x = 40;
  for (const c of colunas) {
    doc.fillColor('#FFFFFF').text(c.titulo, x + 4, y + 6, { width: c.largura - 8, lineBreak: false });
    x += c.largura;
  }
  return y + 20;
}
>>>>>>> master

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'studentId é obrigatório' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const [{ data: student }, { data: aulas }] = await Promise.all([
<<<<<<< HEAD
      supabase.from('profiles').select('*').eq('id', studentId).single(),
      supabase
        .from('aulas_registro')
        .select('*')
        .eq('student_id', studentId)
        .order('data_aula', { ascending: false }),
=======
      supabase.from('profiles').select('nome, email, telefone').eq('id', studentId).single(),
      supabase
        .from('aulas_registro')
        .select('data_aula, hora_inicio, hora_fim, duracao_horas, modalidade, endereco, conteudo_ensinado, teve_tarefa, descricao_tarefa, valor_pago, status_pagamento')
        .eq('student_id', studentId)
        .order('data_aula', { ascending: false })
        .order('hora_inicio', { nullsFirst: true }),
>>>>>>> master
    ]);

    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

<<<<<<< HEAD
    const totalPago = (aulas || [])
      .filter((a) => a.status_pagamento === 'pago')
      .reduce((s, a) => s + Number(a.valor_pago), 0);

    function cell(text, bold = false) {
      return new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: text || '—', bold, size: 18, font: 'Arial' })],
          }),
        ],
      });
    }

    const headerRow = new TableRow({
      children: ['Data', 'Modalidade', 'Horas', 'Conteúdo', 'Tarefa', 'Valor', 'Status'].map(
        (t) => cell(t, true)
      ),
      tableHeader: true,
    });

    const dataRows = (aulas || []).map(
      (a) =>
        new TableRow({
          children: [
            cell(new Date(a.data_aula).toLocaleDateString('pt-BR')),
            cell(a.modalidade),
            cell(`${Number(a.duracao_horas).toFixed(1)}h`),
            cell(a.conteudo_ensinado),
            cell(a.teve_tarefa ? a.descricao_tarefa || 'Sim' : 'Não'),
            cell(`R$ ${Number(a.valor_pago).toFixed(2)}`),
            cell(a.status_pagamento),
          ],
        })
    );

    const borders = {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    };

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: `Dossiê Pedagógico — ${student.nome}`,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `E-mail: ${student.email}`, size: 20, font: 'Arial' }),
                new TextRun({ text: student.telefone ? `  |  Tel: ${student.telefone}` : '', size: 20, font: 'Arial' }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Total de aulas: ${(aulas || []).length}  |  Total pago: R$ ${totalPago.toFixed(2)}`, size: 20, font: 'Arial', bold: true }),
              ],
              spacing: { after: 300 },
            }),
            new Table({
              rows: [headerRow, ...dataRows],
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders,
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="dossie-${student.nome.replace(/\s+/g, '-').toLowerCase()}.docx"`,
=======
    const lista = aulas || [];
    const totalPago = lista.filter((a) => a.status_pagamento === 'pago').reduce((s, a) => s + Number(a.valor_pago), 0);
    const totalPendente = lista.filter((a) => a.status_pagamento === 'pendente').reduce((s, a) => s + Number(a.valor_pago), 0);

    const buffer = await gerarPdf((doc) => {
      const larguraUtil = doc.page.width - 80;
      const fixas = COLUNAS.reduce((s, c) => s + c.largura, 0);
      const colunas = COLUNAS.map((c) => (c.largura ? c : { ...c, largura: larguraUtil - fixas }));

      doc.fillColor('#0F172A').fontSize(18).text('Dossiê Pedagógico', { align: 'left' });
      doc.moveDown(0.3);
      doc.fontSize(14).fillColor('#1E3A8A').text(student.nome);
      doc.fontSize(9).fillColor('#475569').text(
        `E-mail: ${student.email}${student.telefone ? `   |   Telefone: ${student.telefone}` : ''}`
      );
      doc.moveDown(0.8);

      doc.fontSize(10).fillColor('#0F172A').text(
        `Total de aulas: ${lista.length}   |   Recebido: R$ ${totalPago.toFixed(2).replace('.', ',')}   |   Pendente: R$ ${totalPendente.toFixed(2).replace('.', ',')}`
      );
      doc.moveDown(0.8);

      let y = desenharCabecalhoTabela(doc, doc.y, larguraUtil, colunas);

      lista.forEach((a, i) => {
        const conteudo = [a.conteudo_ensinado];
        if (a.modalidade === 'presencial' && a.endereco) conteudo.push(`Local: ${a.endereco}`);
        if (a.teve_tarefa) conteudo.push(`Lição: ${a.descricao_tarefa || 'sim'}`);
        const textoConteudo = conteudo.join('\n');

        const alturaLinha = Math.max(
          22,
          doc.heightOfString(textoConteudo, { width: colunas[3].largura - 8, fontSize: 8.5 }) + 10
        );

        if (y + alturaLinha > doc.page.height - 50) {
          doc.addPage();
          y = desenharCabecalhoTabela(doc, 40, larguraUtil, colunas);
        }

        if (i % 2 === 0) doc.rect(40, y, larguraUtil, alturaLinha).fill('#F1F5F9');

        const valores = [
          new Date(a.data_aula + 'T12:00:00').toLocaleDateString('pt-BR'),
          formatarIntervalo(a.hora_inicio, a.hora_fim) || `${Number(a.duracao_horas).toFixed(1)}h`,
          a.modalidade === 'online' ? 'Online' : 'Presencial',
          null,
          `R$ ${Number(a.valor_pago).toFixed(2).replace('.', ',')}`,
          a.status_pagamento === 'pago' ? 'Pago' : 'Pendente',
        ];

        let x = 40;
        colunas.forEach((c, idx) => {
          doc.fillColor('#0F172A').fontSize(8.5);
          if (idx === 3) {
            doc.text(textoConteudo, x + 4, y + 5, { width: c.largura - 8 });
          } else {
            doc.text(valores[idx], x + 4, y + 6, { width: c.largura - 8, lineBreak: false });
          }
          x += c.largura;
        });

        y += alturaLinha;
        doc.moveTo(40, y).lineTo(40 + larguraUtil, y).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
      });

      if (lista.length === 0) {
        doc.fontSize(10).fillColor('#64748B').text('Nenhuma aula registrada.', 40, y + 12);
      }
    });

    const nomeArquivo = student.nome.replace(/\s+/g, '-').toLowerCase();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="dossie-${nomeArquivo}.pdf"`,
>>>>>>> master
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
