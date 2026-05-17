// ── KIWIFY WEBHOOK HANDLER ────────────────────────────────────────────────────
// Recebe eventos da Kiwify e atualiza o Supabase
// Endpoint: POST /api/kiwify-webhook

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yclvvfapkdwltayuiivy.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// Token secreto para validar que a requisição vem da Kiwify
const KIWIFY_TOKEN = process.env.KIWIFY_WEBHOOK_TOKEN

export default async function handler(req, res) {

  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validar token da Kiwify
  const token = req.query.token || req.headers['x-kiwify-token']
  if (KIWIFY_TOKEN && token !== KIWIFY_TOKEN) {
    console.error('[Webhook] Token inválido:', token)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = req.body
  console.log('[Webhook] Evento recebido:', JSON.stringify(body, null, 2))

  const evento = body?.webhook_event_type || body?.event
  const status = body?.order?.status || body?.status
  const email = body?.Customer?.email || body?.customer?.email || body?.order?.Customer?.email

  console.log('[Webhook] Evento:', evento, '| Status:', status, '| Email:', email)

  // Eventos que LIBERAM acesso
  const eventosAprovados = [
    'order_approved',
    'order_refunded_reversal', // reativação após estorno revertido
  ]

  // Eventos que REVOGAM acesso
  const eventosRevogados = [
    'order_refunded',
    'subscription_canceled',
    'subscription_overdue',
    'chargedback',
  ]

  if (!email) {
    console.error('[Webhook] Email não encontrado no payload')
    return res.status(400).json({ error: 'Email não encontrado' })
  }

  try {

    if (eventosAprovados.includes(evento) || status === 'paid') {
      // ── LIBERAR ACESSO ────────────────────────────────────────────────────
      await liberarAcesso(email, body)
      console.log('[Webhook] ✅ Acesso liberado para:', email)
      return res.status(200).json({ ok: true, acao: 'acesso_liberado', email })

    } else if (eventosRevogados.includes(evento)) {
      // ── REVOGAR ACESSO ────────────────────────────────────────────────────
      await revogarAcesso(email)
      console.log('[Webhook] ❌ Acesso revogado para:', email)
      return res.status(200).json({ ok: true, acao: 'acesso_revogado', email })

    } else {
      // Evento ignorado (ex: order_waiting_payment)
      console.log('[Webhook] Evento ignorado:', evento)
      return res.status(200).json({ ok: true, acao: 'ignorado', evento })
    }

  } catch (err) {
    console.error('[Webhook] Erro:', err)
    return res.status(500).json({ error: 'Erro interno', details: err.message })
  }
}

// ── LIBERAR ACESSO ────────────────────────────────────────────────────────────
async function liberarAcesso(email, body) {

  const dadosAssinatura = {
    email,
    plano: 'pro',
    ativo: true,
    data_compra: new Date().toISOString(),
    kiwify_order_id: body?.order?.id || body?.id || null,
    kiwify_subscription_id: body?.Subscription?.id || body?.subscription_id || null,
    proxima_cobranca: body?.Subscription?.next_payment || null,
    updated_at: new Date().toISOString(),
  }

  // Upsert na tabela assinaturas (cria ou atualiza)
  const { error } = await supabase
    .from('assinaturas')
    .upsert(dadosAssinatura, { onConflict: 'email' })

  if (error) throw error
}

// ── REVOGAR ACESSO ────────────────────────────────────────────────────────────
async function revogarAcesso(email) {

  const { error } = await supabase
    .from('assinaturas')
    .update({
      ativo: false,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email)

  if (error) throw error
}
