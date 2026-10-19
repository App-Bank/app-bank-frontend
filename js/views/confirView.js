// SECTION: Confirm View
function renderConfirmView(container) {
  container.innerHTML = `
    <!-- Formulario de Transferencia -->
    <form id="transfer-form">
      <div class="form-group">
        <label for="amount">Monto a transferir:</label>
        <input type="number" id="amount" required min="1" placeholder="Ej. 500">
      </div>
      <button type="submit" id="submit-btn">Realizar Transferencia</button>
    </form>

    <!-- Contenedor para el Mensaje de Estado (Feedback) -->
    <div id="status-card" class="status-card hidden">
      <p id="status-message"></p>
      <button id="close-btn">Entendido</button>
    </div>
  `;

  const statusCard = container.querySelector('#status-card');
  const statusMessage = container.querySelector('#status-message');
  const form = container.querySelector('#transfer-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simulamos una validación (ej. si hay fondos suficientes)
      const fondosSuficientes = Math.random() > 0.3; // 70% de probabilidad de éxito

      statusMessage.textContent = fondosSuficientes
        ? '¡Transferencia realizada con éxito! '
        : 'Error: Fondos insuficientes o cuenta inválida. ❌';

      statusCard.classList.remove('hidden', 'success', 'error');
      statusCard.classList.add(fondosSuficientes ? 'success' : 'error');
    });
  }

  const closeBtn = container.querySelector('#close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => statusCard.classList.add('hidden'));
  }
}
