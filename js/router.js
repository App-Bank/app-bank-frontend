// SECTION: SPA Client-side Router
class Router {
  constructor(routes, containerId = 'app') {
    this.routes = routes || {};
    this.container = document.getElementById(containerId);
    this.currentRoute = null;
    this.currentCleanup = null;

    window.addEventListener('hashchange', () => this.handleRouting());
  }

  navigate(path) {
    window.location.hash = path.startsWith('/') ? path : `/${path}`;
  }

  handleRouting() {
    const rawHash = window.location.hash.slice(1) || '/login';
    const cleanPath = rawHash.startsWith('/') ? rawHash : `/${rawHash}`;

    // SECTION: Authentication Guard
    const token = sessionStorage.getItem('aura_token');
    const isAuthenticated = !!token;

    if (cleanPath !== '/login' && !isAuthenticated) {
      this.navigate('/login');
      return;
    }

    if (cleanPath === '/login' && isAuthenticated) {
      this.navigate('/dashboard');
      return;
    }

    const handler = this.routes[cleanPath];

    if (handler && typeof handler === 'function') {
      if (typeof this.currentCleanup === 'function') {
        try {
          this.currentCleanup();
        } catch (err) {
          console.warn('[Router] View cleanup error:', err);
        }
        this.currentCleanup = null;
      }

      this.currentRoute = cleanPath;
      if (this.container) {
        this.container.classList.toggle('is-login-view', cleanPath === '/login');
        this.container.classList.toggle('is-dashboard-view', cleanPath === '/dashboard');
        this.container.classList.toggle('is-history-view', cleanPath === '/history');
        this.container.classList.toggle('is-transfer-view', cleanPath === '/transfer');
      }
      const cleanupHook = handler(this.container);
      if (typeof cleanupHook === 'function') {
        this.currentCleanup = cleanupHook;
      }
    } else {
      console.warn(`Route not found: ${cleanPath}. Redirecting...`);
      this.navigate(isAuthenticated ? '/dashboard' : '/login');
    }
  }
}
