// SECTION: Confirm View
function renderConfirmView(container, data = {}) {
  const name = data.name || '—';
  const amountText = (typeof window.formatCurrency === 'function')
    ? window.formatCurrency(Number(data.amount) || 0)
    : `${Number(data.amount) || 0} €`;
  const concept = data.concept || 'Transferencia';
  
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
        <section class="card step-card">
          <div class="step-head"><span class="step-num">1</span><h2>Destinatario</h2></div>
          <p class="source-balance">${name}</p>
        </section>

        <section class="card step-card">
          <div class="step-head"><span class="step-num">2</span><h2>Importe</h2></div>
          <div class="total-row"><span>Total enviado</span><output>${amountText}</output></div>
        </section>

        <section class="card step-card">
          <div class="step-head"><span class="step-num">3</span><h2>Concepto</h2></div>
          <p class="source-balance">${concept}</p>
        </section>

        <a href="#/transfer" class="btn-confirm">Nueva transferencia</a>
      </main>

      <div id="bottom-nav-container"></div>
    </div>
  `;

   if (typeof BottomNavComponent !== 'undefined') {
    BottomNavComponent.render('#bottom-nav-container', 'transfer');
  }
}

  
