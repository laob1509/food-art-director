// ── STRIPE INTEGRATION (FUTURE) ────────────────────────────────────────────
// Prepared for SaaS subscription model
// Activate when Stripe account is ready

/**
 * Plans configuration
 * Update with real Stripe Price IDs when ready
 */
export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    currency: 'BRL',
    features: [
      '10 prompts por mês',
      'Modelos básicos',
      'PT apenas'
    ],
    limits: {
      promptsPerMonth: 10,
      models: ['gpt', 'dalle'],
      languages: ['pt']
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 4700, // R$47/mês em centavos
    currency: 'BRL',
    stripePriceId: 'price_XXXX', // Replace with real Stripe Price ID
    features: [
      'Prompts ilimitados',
      'Todos os modelos de IA',
      'PT + EN',
      'Histórico de prompts',
      'Suporte prioritário'
    ],
    limits: {
      promptsPerMonth: Infinity,
      models: ['gpt', 'gemini', 'midjourney', 'flux', 'sdxl', 'dalle'],
      languages: ['pt', 'en']
    }
  }
};

/**
 * Check if member has access to a feature
 * @param {string} feature - Feature to check
 * @param {object} member - Memberstack member object
 */
export function hasAccess(feature, member) {
  // TODO: implement plan-based access control
  // For now, all features are available
  return true;
}

/**
 * Open Stripe checkout (future)
 * @param {string} planId - Plan ID to checkout
 */
export async function openCheckout(planId) {
  const plan = PLANS[planId];
  if (!plan || !plan.stripePriceId) {
    console.warn('[Stripe] Plan not configured:', planId);
    return;
  }
  // TODO: redirect to Stripe checkout
  console.log('[Stripe] Opening checkout for plan:', plan.name);
}

export default { PLANS, hasAccess, openCheckout };
