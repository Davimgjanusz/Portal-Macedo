import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { preference } from '@/lib/mercadopago';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { aula_id } = await request.json();
    if (!aula_id) {
      return NextResponse.json({ error: 'Aula não informada' }, { status: 400 });
    }

    const { data: aula } = await supabase
      .from('aulas_registro')
      .select('id, student_id, valor_pago, status_pagamento, conteudo_ensinado, data_aula')
      .eq('id', aula_id)
      .single();

    if (!aula || aula.student_id !== user.id) {
      return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 });
    }

    if (aula.status_pagamento === 'pago') {
      return NextResponse.json({ error: 'Esta aula já está paga' }, { status: 409 });
    }

    const service = await createServiceClient();
    const { data: pagamento, error: insertErr } = await service
      .from('pagamentos')
      .insert({ student_id: user.id, aula_id: aula.id, valor: aula.valor_pago, status: 'pending' })
      .select('id')
      .single();

    if (insertErr) throw insertErr;

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const data = new Date(aula.data_aula + 'T12:00:00').toLocaleDateString('pt-BR');

    const pref = await preference.create({
      body: {
        items: [
          {
            id: aula.id,
            title: `Aula de matemática — ${data}`,
            description: aula.conteudo_ensinado.slice(0, 200),
            quantity: 1,
            unit_price: Number(aula.valor_pago),
            currency_id: 'BRL',
          },
        ],
        external_reference: pagamento.id,
        notification_url: `${origin}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${origin}/student?pagamento=sucesso`,
          pending: `${origin}/student?pagamento=pendente`,
          failure: `${origin}/student?pagamento=falhou`,
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({ init_point: pref.init_point });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Erro ao iniciar pagamento' }, { status: 500 });
  }
}
