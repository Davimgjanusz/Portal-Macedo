import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Packer, Document, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';

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
      supabase.from('profiles').select('*').eq('id', studentId).single(),
      supabase
        .from('aulas_registro')
        .select('*')
        .eq('student_id', studentId)
        .order('data_aula', { ascending: false }),
    ]);

    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

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
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
