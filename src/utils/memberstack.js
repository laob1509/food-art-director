// ── MEMBERSTACK INTEGRATION ────────────────────────────────────────────────
// Public Key: pk_sb_89e84c8e7969fa7ad0b2
// Docs: https://docs.memberstack.com

const MEMBERSTACK_PUBLIC_KEY = 'pk_sb_89e84c8e7969fa7ad0b2';

/**
 * Initialize Memberstack
 * Called once on app load
 */
export async function initMemberstack() {
  if (typeof window.$memberstackDom === 'undefined') {
    console.warn('[Memberstack] SDK not loaded yet');
    return null;
  }
  return window.$memberstackDom;
}

/**
 * Get current member session
 * Returns member object or null
 */
export async function getCurrentMember() {
  try {
    const ms = window.$memberstackDom;
    if (!ms) return null;
    const { data: member } = await ms.getCurrentMember();
    return member;
  } catch (e) {
    return null;
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn() {
  const member = await getCurrentMember();
  return !!member;
}

/**
 * Open Memberstack login modal
 */
export function openLogin() {
  if (window.$memberstackDom) {
    window.$memberstackDom.openModal('LOGIN');
  }
}

/**
 * Open Memberstack signup modal
 */
export function openSignup() {
  if (window.$memberstackDom) {
    window.$memberstackDom.openModal('SIGNUP');
  }
}

/**
 * Logout current member
 */
export async function logout() {
  if (window.$memberstackDom) {
    await window.$memberstackDom.logout();
    window.location.reload();
  }
}

/**
 * Protect a page — redirect to login if not authenticated
 */
export async function requireAuth() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    openLogin();
    return false;
  }
  return true;
}

/**
 * Get member plan/subscription info
 */
export async function getMemberPlan() {
  const member = await getCurrentMember();
  if (!member) return null;
  return member.planConnections || [];
}

export default {
  init: initMemberstack,
  getCurrentMember,
  isLoggedIn,
  openLogin,
  openSignup,
  logout,
  requireAuth,
  getMemberPlan
};
