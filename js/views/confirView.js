function renderConfirmView(container, data = {}) {
  const transferData = (data && (data.amount != null || data.error)) ? data : AppState.lastTransfer;
  if (!transferData) {
    window.appRouter.navigate('/transfer');
    return;
  }

  const isError = Boolean(transferData.error);
  const esc = window.escapeHtml;
  const iban = (transferData.recipientIban || transferData.iban || '').replace(/\s+/g, '');
  const fullIban = window.formatIban(iban);
  const recipient = transferData.recipientName || transferData.name || 'Destinatario';
  const fmtAmount = window.formatCurrency(transferData.amount, { noSymbol: true });
  const concept = transferData.concept || 'Transferencia';
  const errorMsg = transferData.message || 'No se pudo completar la operación';

  container.innerHTML = `
    <div class="aurora" aria-hidden="true"></div>
    <div class="app">
      <header class="app-header" id="top">
        <div class="app-top">
          <a href="#/dashboard" class="app-brand"><span class="logo-mark" aria-hidden="true"></span><span>AURA NEO-BANKING</span></a>
        </div>
        <h1 class="screen-title">${isError ? 'Transferencia fallida' : 'Transferencia enviada'}</h1>
      </header>

      <main class="app-main transfer">
        <div class="transfer-form">
          <section class="card step-card confirm-amount-card">
            <div class="step-head"><h2>${isError ? 'Importe no enviado' : 'Importe'}</h2></div>
            <div class="amount-input">
              <input class="amount-field readonly-amount" type="text" readonly value="${esc(fmtAmount)}" aria-label="Importe de la transferencia" tabindex="-1">
              <span class="currency" aria-hidden="true">€</span>
            </div>
            ${isError ? '<p class="amount-note">Operación no completada</p>' : ''}
          </section>

          <section class="card step-card confirm-recipient-card ${isError ? 'error-card' : ''}">
            <div class="step-head"><h2>${isError ? 'Error' : 'Destinatario'}</h2></div>
            <div class="recipient">
              <div class="recipient-fields">
                <input class="field-input" type="text" readonly value="${esc(isError ? errorMsg : recipient)}" aria-label="${isError ? 'Detalle del error' : 'Nombre del destinatario'}" tabindex="-1">
                ${(!isError && fullIban) ? `
                <span class="iban-field">
                  <input class="field-input" id="recipient-iban" type="text" readonly value="${esc(fullIban)}" aria-label="IBAN del destinatario" tabindex="-1">
                </span>` : ''}
              </div>
            </div>
          </section>

          <section class="card step-card confirm-concept-card">
            <div class="step-head"><h2>Concepto</h2></div>
            <input class="concepto" type="text" readonly value="${esc(concept)}" aria-label="Concepto de la transferencia" tabindex="-1">
          </section>

          <a href="#/transfer" id="btn-retry" class="btn-confirm">${isError ? 'Reintentar' : 'Nueva transferencia'}</a>
        </div>
      </main>

      <div id="bottom-nav-container"></div>
    </div>
  `;

  BottomNavComponent.render(container.querySelector('#bottom-nav-container'), 'transfer');

  return () => {
    AppState.lastTransfer = null;
  };
}