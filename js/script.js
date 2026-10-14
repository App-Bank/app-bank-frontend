// Aura Neo-Banking Engine - Funcionalidad básica interactiva de la interfaz
document.addEventListener('DOMContentLoaded', () => {

    // 1. Alternar visibilidad de saldo sensible (Botón Ojo)
    const toggleBalanceBtn = document.querySelector('.btn-icon');
    const balanceAmountEl = document.querySelector('.balance-amount');
    
    let balanceHidden = false;
    const originalBalanceHTML = balanceAmountEl.innerHTML;

    toggleBalanceBtn.addEventListener('click', () => {
        balanceHidden = !balanceHidden;
        if (balanceHidden) {
            balanceAmountEl.textContent = '••••••';
            toggleBalanceBtn.textContent = '🔒';
        } else {
            balanceAmountEl.innerHTML = originalBalanceHTML;
            toggleBalanceBtn.textContent = '👁️';
        }
    });

    // 2. Control de navegación activa de la App
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remover estado activo de los otros elementos
            navItems.forEach(nav => nav.classList.remove('active'));
            // Añadir estado activo al seleccionado
            item.classList.add('active');
        });
    });

    // 3. Simulación de refresco en vivo para transacciones (Micro-interacción de red)
    const simulateLiveUpdate = () => {
        console.log("Aura Ledger: Sincronizando estados en segundo plano...");
        // Aquí se conectaría la lógica con la API o Websockets en producción.
    };

    setInterval(simulateLiveUpdate, 30000); // Sincroniza cada 30 segundos
});
