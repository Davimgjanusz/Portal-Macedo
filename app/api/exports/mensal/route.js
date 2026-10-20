import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';

const AZUL = 'FF1E3A8A';
const TEXTO = 'FF0F172A';
const MUTED = 'FF64748B';
const ZEBRA = 'FFF8FAFC';
const DIA = 'FFE0ECFF';
const BORDA = 'FFE2E8F0';
const PAGO = 'FF0F8A5F';
const PENDENTE = 'FFB45309';
const MOEDA = '"R$" #,##0.00';
const HORAS = '0.00';

const bordaFina = {
  top: { style: 'thin', color: { argb: BORDA } },
  bottom: { style: 'thin', color: { argb: BORDA } },
  left: { style: 'thin', color: { argb: BORDA } },
  right: { style: 'thin', color: { argb: BORDA } },
};

function cabecalho(celula) {
  celula.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
  celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
  celula.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  celula.border = bordaFina;
}

function corpo(celula, { zebra = false, align = 'left' } = {}) {
  celula.font = { size: 10, color: { argb: TEXTO } };
  celula.alignment = { vertical: 'middle', horizontal: align, wrapText: true };
  celula.border = bordaFina;
  if (zebra) celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
}

function statusCelula(celula, pago, zebra) {
  corpo(celula, { zebra, align: 'center' });
  celula.value = pago ? 'Pago' : 'Pendente';
  celula.font = { bold: true, size: 10, color: { argb: pago ? PAGO : PENDENTE } };
}

function nomeMes(mes) {
  const [ano, m] = mes.split('-').map(Number);
  const texto = new Date(ano, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function diaPorExtenso(iso) {
  const texto = new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function intervaloDoMes(mes) {
  const [ano, m] = mes.split('-').map(Number);
  const ultimo = new Date(ano, m, 0).getDate();
  const base = `${ano}-${String(m).padStart(2, '0')}`;
  return { inicio: `${base}-01`, fim: `${base}-${String(ultimo).padStart(2, '0')}` };
}

function hora(v) {
  return v ? v.slice(0, 5) : '';
}

function montarAba_Resumo(wb, { mes, aulas, geradoEm }) {
  const ws = wb.addWorksheet('Resumo', { views: [{ showGridLines: false }] });
  ws.columns = [{ width: 3 }, { width: 24 }, { width: 24 }, { width: 24 }, { width: 24 }];

  ws.mergeCells('B1:E1');
  ws.getCell('B1').value = `Relatório mensal · ${nomeMes(mes)}`;
  ws.getCell('B1').font = { bold: true, size: 18, color: { argb: AZUL } };
  ws.getRow(1).height = 32;

  ws.mergeCells('B2:E2');
  ws.getCell('B2').value = `Gerado em ${geradoEm} · Portal Macedo`;
  ws.getCell('B2').font = { size: 9, color: { argb: MUTED } };

  const totalPago = aulas.filter((a) => a.status_pagamento === 'pago').reduce((s, a) => s + Number(a.valor_pago), 0);
  const totalPendente = aulas.filter((a) => a.status_pagamento === 'pendente').reduce((s, a) => s + Number(a.valor_pago), 0);
  const totalHoras = aulas.reduce((s, a) => s + Number(a.duracao_horas), 0);
  const alunos = new Set(aulas.map((a) => a.student_id)).size;
  const dias = new Set(aulas.map((a) => a.data_aula)).size;

  const kpis = [
    { rotulo: 'Aulas no mês', valor: aulas.length, formato: '0' },
    { rotulo: 'Alunos atendidos', valor: alunos, formato: '0' },
    { rotulo: 'Dias com aula', valor: dias, formato: '0' },
    { rotulo: 'Horas dadas', valor: totalHoras, formato: '0.0"h"' },
  ];
  kpis.forEach((k, i) => {
    const col = String.fromCharCode(66 + i);
    const rotulo = ws.getCell(`${col}4`);
    rotulo.value = k.rotulo;
    rotulo.font = { size: 9, color: { argb: MUTED }, bold: true };
    rotulo.alignment = { horizontal: 'center' };
    rotulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
    const valor = ws.getCell(`${col}5`);
    valor.value = k.valor;
    valor.numFmt = k.formato;
    valor.font = { size: 20, bold: true, color: { argb: AZUL } };
    valor.alignment = { horizontal: 'center', vertical: 'middle' };
    valor.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
  });
  ws.getRow(5).height = 34;

  ws.getCell('B7').value = 'Financeiro';
  ws.getCell('B7').font = { bold: true, size: 12, color: { argb: TEXTO } };
  const financeiro = [
    ['Recebido', totalPago, PAGO],
    ['Pendente', totalPendente, PENDENTE],
    ['Total do mês', totalPago + totalPendente, TEXTO],
  ];
  financeiro.forEach(([rotulo, valor, cor], i) => {
    const linha = 8 + i;
    const r = ws.getCell(`B${linha}`);
    r.value = rotulo;
    corpo(r);
    const v = ws.getCell(`C${linha}`);
    v.value = valor;
    v.numFmt = MOEDA;
    corpo(v, { align: 'right' });
    v.font = { bold: true, size: 11, color: { argb: cor } };
  });

  ws.getCell('B12').value = 'Modalidade';
  ws.getCell('B12').font = { bold: true, size: 12, color: { argb: TEXTO } };
  const online = aulas.filter((a) => a.modalidade === 'online').length;
  const presencial = aulas.length - online;
  [['Online', online], ['Presencial', presencial]].forEach(([rotulo, valor], i) => {
    const linha = 13 + i;
    corpo(ws.getCell(`B${linha}`));
    ws.getCell(`B${linha}`).value = rotulo;
    corpo(ws.getCell(`C${linha}`), { align: 'right' });
    ws.getCell(`C${linha}`).value = valor;
  });

  ws.views = [{ showGridLines: false }];
}

function montarAba_PorDia(wb, { mes, aulas }) {
  const ws = wb.addWorksheet('Por dia');
  const colunas = [
    { header: 'Início', width: 10 },
    { header: 'Término', width: 10 },
    { header: 'Aluno', width: 26 },
    { header: 'Modalidade', width: 14 },
    { header: 'Endereço', width: 34 },
    { header: 'Conteúdo ensinado', width: 40 },
    { header: 'Lição de casa', width: 28 },
    { header: 'Valor', width: 14 },
    { header: 'Pagamento', width: 14 },
  ];
  ws.columns = colunas.map((c) => ({ width: c.width }));

  ws.mergeCells(1, 1, 1, colunas.length);
  ws.getCell(1, 1).value = `Aulas por dia · ${nomeMes(mes)}`;
  ws.getCell(1, 1).font = { bold: true, size: 14, color: { argb: AZUL } };
  ws.getRow(1).height = 26;

  const cabecalhoRow = ws.getRow(3);
  colunas.forEach((c, i) => {
    cabecalhoRow.getCell(i + 1).value = c.header;
    cabecalho(cabecalhoRow.getCell(i + 1));
  });
  cabecalhoRow.height = 24;
  ws.views = [{ state: 'frozen', ySplit: 3, showGridLines: false }];

  const grupos = {};
  for (const a of aulas) (grupos[a.data_aula] ||= []).push(a);

  let linha = 4;
  for (const [dataIso, lista] of Object.entries(grupos)) {
    const total = lista.reduce((s, a) => s + Number(a.valor_pago), 0);
    ws.mergeCells(linha, 1, linha, colunas.length);
    const banda = ws.getCell(linha, 1);
    banda.value = `${diaPorExtenso(dataIso)}  ·  ${lista.length} ${lista.length === 1 ? 'aula' : 'aulas'}  ·  R$ ${total.toFixed(2).replace('.', ',')}`;
    banda.font = { bold: true, size: 11, color: { argb: AZUL } };
    banda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DIA } };
    banda.alignment = { vertical: 'middle', indent: 1 };
    ws.getRow(linha).height = 22;
    linha++;

    lista.forEach((a, i) => {
      const zebra = i % 2 === 1;
      const r = ws.getRow(linha);
      const valores = [
        hora(a.hora_inicio),
        hora(a.hora_fim),
        a.profiles?.nome || '—',
        a.modalidade === 'online' ? 'Online' : 'Presencial',
        a.modalidade === 'presencial' ? a.endereco || '—' : '—',
        a.conteudo_ensinado,
        a.teve_tarefa ? a.descricao_tarefa || 'Sim' : 'Não',
      ];
      valores.forEach((v, j) => {
        const c = r.getCell(j + 1);
        c.value = v;
        corpo(c, { zebra, align: j < 2 ? 'center' : 'left' });
      });
      const valorCell = r.getCell(8);
      valorCell.value = Number(a.valor_pago);
      valorCell.numFmt = MOEDA;
      corpo(valorCell, { zebra, align: 'right' });
      statusCelula(r.getCell(9), a.status_pagamento === 'pago', zebra);
      r.height = 30;
      linha++;
    });

    linha++;
  }
}

function montarAba_Aulas(wb, { mes, aulas }) {
  const ws = wb.addWorksheet('Aulas');
  const colunas = [
    { header: 'Data', key: 'data', width: 12 },
    { header: 'Início', key: 'inicio', width: 9 },
    { header: 'Término', key: 'fim', width: 9 },
    { header: 'Aluno', key: 'aluno', width: 26 },
    { header: 'Modalidade', key: 'modalidade', width: 13 },
    { header: 'Endereço', key: 'endereco', width: 34 },
    { header: 'Duração (h)', key: 'duracao', width: 12 },
    { header: 'Valor', key: 'valor', width: 13 },
    { header: 'Pagamento', key: 'pagamento', width: 13 },
    { header: 'Conteúdo ensinado', key: 'conteudo', width: 40 },
    { header: 'Lição de casa', key: 'licao', width: 28 },
  ];
  ws.columns = colunas.map((c) => ({ key: c.key, width: c.width }));
  colunas.forEach((c, i) => cabecalho(ws.getRow(1).getCell(i + 1)));
  ws.getRow(1).values = colunas.map((c) => c.header);
  ws.getRow(1).height = 24;
  ws.views = [{ state: 'frozen', ySplit: 1, showGridLines: false }];

  aulas.forEach((a, i) => {
    const zebra = i % 2 === 1;
    const r = ws.getRow(i + 2);
    const data = new Date(a.data_aula + 'T12:00:00');
    corpo(r.getCell(1), { zebra, align: 'center' });
    r.getCell(1).value = data;
    r.getCell(1).numFmt = 'dd/mm/yyyy';
    corpo(r.getCell(2), { zebra, align: 'center' });
    r.getCell(2).value = hora(a.hora_inicio);
    corpo(r.getCell(3), { zebra, align: 'center' });
    r.getCell(3).value = hora(a.hora_fim);
    corpo(r.getCell(4), { zebra });
    r.getCell(4).value = a.profiles?.nome || '—';
    corpo(r.getCell(5), { zebra });
    r.getCell(5).value = a.modalidade === 'online' ? 'Online' : 'Presencial';
    corpo(r.getCell(6), { zebra });
    r.getCell(6).value = a.modalidade === 'presencial' ? a.endereco || '—' : '—';
    corpo(r.getCell(7), { zebra, align: 'center' });
    r.getCell(7).value = Number(a.duracao_horas);
    r.getCell(7).numFmt = HORAS;
    corpo(r.getCell(8), { zebra, align: 'right' });
    r.getCell(8).value = Number(a.valor_pago);
    r.getCell(8).numFmt = MOEDA;
    statusCelula(r.getCell(9), a.status_pagamento === 'pago', zebra);
    corpo(r.getCell(10), { zebra });
    r.getCell(10).value = a.conteudo_ensinado;
    corpo(r.getCell(11), { zebra });
    r.getCell(11).value = a.teve_tarefa ? a.descricao_tarefa || 'Sim' : 'Não';
    r.height = 28;
  });

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: colunas.length } };
}

export async function GET(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mes = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      return NextResponse.json({ error: 'Mês inválido' }, { status: 400 });
    }

    const { inicio, fim } = intervaloDoMes(mes);
    const { data: aulas, error } = await supabase
      .from('aulas_registro')
      .select('data_aula, hora_inicio, hora_fim, modalidade, endereco, duracao_horas, valor_pago, status_pagamento, conteudo_ensinado, teve_tarefa, descricao_tarefa, student_id, profiles!aulas_registro_student_id_fkey(nome)')
      .eq('teacher_id', user.id)
      .gte('data_aula', inicio)
      .lte('data_aula', fim)
      .order('data_aula')
      .order('hora_inicio', { nullsFirst: true });

    if (error) throw error;

    if (!aulas || aulas.length === 0) {
      return NextResponse.json({ error: 'Nenhuma aula registrada neste mês' }, { status: 404 });
    }

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Portal Macedo';
    wb.created = new Date();
    const geradoEm = new Date().toLocaleDateString('pt-BR');

    montarAba_Resumo(wb, { mes, aulas, geradoEm });
    montarAba_PorDia(wb, { mes, aulas });
    montarAba_Aulas(wb, { mes, aulas });

    const buffer = await wb.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="relatorio-${mes}.xlsx"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
