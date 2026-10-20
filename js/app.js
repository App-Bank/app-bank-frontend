// SECTION: Global Application State
const AppState = {
  user: null,
  userName: null,
  isAuthenticated: false,
  token: null,
  accountId: null,
  balance: null
};

try {
  AppState.token = sessionStorage.getItem('aura_token') || null;
  AppState.user = sessionStorage.getItem('aura_user') || null;
  AppState.userName = sessionStorage.getItem('aura_user_name') || null;
  AppState.isAuthenticated = !!AppState.token;
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
  const isZero = Math.abs(num) < 0.005;
  const isNegative = !isZero && num < 0;
  const isPositive = !isZero && num > 0;

  const formattedNum = Math.abs(num).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let sign = '';
  if (isNegative) {
    sign = '-';
  } else if (isPositive && options.includeSign) {
    sign = '+';
  }

  if (options.noSymbol) {
    return `${sign}${formattedNum}`;
  }
  return `${sign}${formattedNum} €`;
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
    '/history': renderHistoryView
  }, 'app');
  window.appRouter.handleRouting();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSPA);
} else {
  initSPA();
}
