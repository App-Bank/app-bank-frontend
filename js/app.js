// SECTION: Global Application State
const AppState = {
  user: null,
  isAuthenticated: false,
  balance: null
  // TODO / FUTURE: Add auth token persistence (sessionStorage / localStorage)
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
  const absVal = Math.abs(num).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  if (options.includeSign) {
    return `${num > 0 ? '+' : '-'}${absVal} €`;
  }
  return `${absVal} €`;
};

// SECTION: SPA Application Bootstrapper
function initSPA() {
  window.appRouter = new Router({
    '/login': renderLoginView,
    '/dashboard': renderHomeView,
    '/transfer': renderTransferView,
    '/history': renderHistoryView
  }, 'app');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSPA);
} else {
  initSPA();
}
