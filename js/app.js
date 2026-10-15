// SECTION: Global Application State
const AppState = {
  user: null,
  isAuthenticated: false,
  balance: 14850.00
  // TODO / FUTURE: Add auth token persistence (sessionStorage / localStorage)
};

// SECTION: SPA Application Bootstrapper
document.addEventListener('DOMContentLoaded', () => {
  // TODO / FUTURE: Partner will integrate the home dashboard (/dashboard or /)
  window.appRouter = new Router({
    '/login': renderLoginView,
    '/dashboard': renderDashboardView,
    '/history': renderHistoryView,
    '/historial': renderHistoryView
  }, 'app');
});
