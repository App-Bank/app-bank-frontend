// SECTION: Master Script Bundle Loader
(function() {
  const currentScript = document.currentScript;
  const basePath = currentScript 
    ? currentScript.src.substring(0, currentScript.src.lastIndexOf('/') + 1)
    : 'js/';

  const modules = [
    'services/api.js',
    'services/transactionService.js',
    'components/bottomNav.js',
    'controllers/loginController.js',
    'views/loginView.js',
    'views/homeView.js',
    'views/transferView.js',
    'views/historyView.js',
    'views/confirView.js',
    'router.js',
    'app.js'
  ];

  modules.forEach(file => {
    const s = document.createElement('script');
    s.src = basePath + file;
    s.async = false;
    document.head.appendChild(s);
  });
})();
