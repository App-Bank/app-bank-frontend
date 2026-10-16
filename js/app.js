// SECTION: Global Application State
const AppState = {
  user: null,
  isAuthenticated: false,
  balance: 34850.40
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

// SECTION: SPA Application Bootstrapper
function initSPA() {
  window.appRouter = new Router({
    '/login': renderLoginView,
    '/dashboard': renderHomeView,
    '/home': renderHomeView,
    '/inicio': renderHomeView,
    '/transfer': renderTransferView,
    '/transferir': renderTransferView,
    '/history': renderHistoryView,
    '/historial': renderHistoryView
  }, 'app');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSPA);
} else {
  initSPA();
}
