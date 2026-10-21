// SECTION: Global Application State
const AppState = {
  user: null,
  userName: null,
  accountId: null,
  balance: null,
  lastTransfer: null
};

try {
  AppState.user = sessionStorage.getItem('aura_user') || null;
  AppState.userName = sessionStorage.getItem('aura_user_name') || null;
} catch (_) {}

// SECTION: Global Sanitization Helper
window.escapeHtml = function(str) {
  return String(str ?? '').replace(/[&<>"']/g, function(c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c];
  });
};

// SECTION: Global UI Helpers (Toast Notification)
let appToastTimer = null;
window.showToast = function(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;
  if (appToastTimer) clearTimeout(appToastTimer);

  toast.className = `mobile-toast ${type} show`;
  toastText.textContent = message;

  appToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
};

// SECTION: Global Formatters
window.formatCurrency = function(amount, options = {}) {
  const num = Number(amount) || 0;
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = abs < 0.005 ? '' : (num < 0 ? '-' : (options.includeSign ? '+' : ''));
  return `${sign}${formatted}${options.noSymbol ? '' : ' €'}`;
};

window.formatIban = function(iban) {
  if (!iban) return '';
  const clean = iban.replace(/\s+/g, '');
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
};

// SECTION: SPA Application Bootstrapper
function initSPA() {
  window.appRouter = new Router({
    '/login': renderLoginView,
    '/dashboard': renderHomeView,
    '/transfer': renderTransferView,
    '/confirm': renderConfirmView,
    '/history': renderHistoryView
  }, 'app');
  window.appRouter.handleRouting();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSPA);
} else {
  initSPA();
}
