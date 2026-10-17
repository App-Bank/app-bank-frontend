// SECTION: SPA Client-side Router
class Router {
  constructor(routes, containerId = 'app') {
    this.routes = routes || {};
    this.container = document.getElementById(containerId);
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.handleRouting());

    if (document.readyState !== 'loading') {
      this.handleRouting();
    } else {
      window.addEventListener('DOMContentLoaded', () => this.handleRouting());
    }
  }

  navigate(path) {
    window.location.hash = path.startsWith('/') ? path : `/${path}`;
  }

  handleRouting() {
    const rawHash = window.location.hash.slice(1) || '/login';
    const cleanPath = rawHash.startsWith('/') ? rawHash : `/${rawHash}`;

    // TODO / FUTURE: Add authentication middleware / route guards to protect private views
    const handler = this.routes[cleanPath] || this.routes['/login'];

    if (handler && typeof handler === 'function') {
      this.currentRoute = cleanPath;
      handler(this.container);
    } else {
      console.warn(`Route not found: ${cleanPath}. Redirecting to /login`);
      this.navigate('/login');
    }
  }
}
