import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { payment } from '@/lib/mercadopago';

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID ausente' }, { status: 400 });
    }

    const paymentData = await payment.get({ id: paymentId });
    const status = paymentData.status;
    const externalRef = paymentData.external_reference;

    const supabase = await createServiceClient();

    const { error } = await supabase
      .from('pagamentos')
      .update({ status, mp_payment_id: String(paymentId) })
      .eq('id', externalRef);

    if (error) throw error;

    if (status === 'approved' && externalRef) {
      const { data: pagamento } = await supabase
        .from('pagamentos')
        .select('aula_id')
        .eq('id', externalRef)
        .single();

      if (pagamento?.aula_id) {
        await supabase
          .from('aulas_registro')
          .update({ status_pagamento: 'pago' })
          .eq('id', pagamento.aula_id);
      }
    }

    return NextResponse.json({ received: true, status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
