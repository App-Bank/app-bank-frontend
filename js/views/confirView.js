// SECTION: Confirm View
function renderConfirmView(container, data = {}) {
  const transferData = (data && data.amount != null) ? data : AppState.lastTransfer;
  if (!transferData) {
    window.appRouter.navigate('/transfer');
    return;
  }

  const esc = window.escapeHtml;
  const iban = (transferData.recipientIban || transferData.iban || '').replace(/\s+/g, '');
  const fullIban = window.formatIban(iban);
  const recipient = transferData.recipientName || transferData.name || 'Destinatario';
  const amountText = window.formatCurrency(transferData.amount);
  const concept = transferData.concept || 'Transferencia';

  container.innerHTML = `
    <div class="aurora" aria-hidden="true"></div>
    <div class="app">
      <header class="app-header" id="top">
        <div class="app-top">
          <a href="#/dashboard" class="app-brand"><span class="logo-mark" aria-hidden="true"></span><span>AURA NEO-BANKING</span></a>
        </div>
        <h1 class="screen-title">Transferencia enviada</h1>
      </header>

      <main class="app-main transfer">
        <div class="transfer-form">
          <section class="card step-card">
            <div class="step-head"><span class="step-num" aria-hidden="true">1</span><h2>Destinatario</h2></div>
            <p class="source-balance">${esc(recipient)}</p>
            ${fullIban ? `<p class="amount-note">${esc(fullIban)}</p>` : ''}
          </section>

          <section class="card step-card">
            <div class="step-head"><span class="step-num" aria-hidden="true">2</span><h2>Importe</h2></div>
            <div class="total-row"><span>Total enviado</span><output>${esc(amountText)}</output></div>
          </section>

          <section class="card step-card">
            <div class="step-head"><span class="step-num" aria-hidden="true">3</span><h2>Concepto</h2></div>
            <p class="source-balance">${esc(concept)}</p>
          </section>

          <a href="#/transfer" class="btn-confirm">Nueva transferencia</a>
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
