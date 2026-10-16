// SECTION: View - Transfer Screen (Transferir)
function renderTransferView(container) {
  container.innerHTML = `
    <div class="aurora" aria-hidden="true"></div>
    <div class="app" style="padding-bottom: 90px; max-width: 430px; margin: 0 auto;">
      <header class="app-header" id="top">
        <div class="app-top">
          <a href="#/dashboard" class="app-brand">
            <span class="logo-mark" aria-hidden="true"></span>
            <span>AURA NEO-BANKING</span>
          </a>
        </div>

        <h1 class="screen-title">Transferir</h1>

        <div class="source-account">
          <p>Desde <strong>Cuenta Corriente</strong></p>
          <p class="source-balance">Disponible <span id="transfer-source-balance">34.850,40 €</span></p>
        </div>
      </header>

      <main class="app-main transfer">
        <!-- Step 1: Destinatario -->
        <section class="card step-card">
          <div class="step-head">
            <span class="step-num">1</span>
            <h2>Destinatario</h2>
          </div>

          <div class="recipient">
            <span class="recipient-avatar" id="recipient-avatar" aria-hidden="true">?</span>
            <div class="recipient-fields">
              <input class="field-input" id="recipient-name" type="text"
                     placeholder="Nombre del destinatario" autocomplete="off" aria-label="Nombre del destinatario">
              <span class="iban-field">
                <input class="field-input" id="recipient-iban" type="text"
                       placeholder="IBAN · ES00 0000 0000 0000 0000 0000"
                       autocomplete="off" spellcheck="false" aria-label="IBAN del destinatario">
                <span class="valid-badge" id="iban-badge" hidden>Válido</span>
              </span>
            </div>
          </div>
        </section>

        <!-- Step 2: Importe -->
        <section class="card step-card">
          <div class="step-head">
            <span class="step-num">2</span>
            <h2>Importe</h2>
          </div>

          <div class="amount-input">
            <input class="amount-field" id="amount-field" type="text" inputmode="decimal"
                   value="250,00" aria-label="Importe a enviar" autocomplete="off">
            <span class="currency" aria-hidden="true">€</span>
          </div>
          <p class="amount-note">Sin comisiones bancarias</p>

          <div class="quick-adds">
            <button type="button" data-add="20">+20 €</button>
            <button type="button" data-add="50">+50 €</button>
            <button type="button" data-add="100">+100 €</button>
          </div>
        </section>

        <!-- Step 3: Concepto -->
        <section class="card step-card">
          <div class="step-head">
            <span class="step-num">3</span>
            <h2>Concepto</h2>
          </div>
          <input class="concepto" id="concepto" type="text" maxlength="60"
                 placeholder="Añade un motivo" value="Transferencia habitual">
        </section>

        <!-- Step 4: Confirmación -->
        <section class="card step-card">
          <div class="step-head">
            <span class="step-num">4</span>
            <h2>Confirmación</h2>
          </div>
          <div class="total-row">
            <span>Total a enviar</span>
            <strong id="total">250,00 €</strong>
          </div>
        </section>

        <button class="btn-confirm" id="confirmar" type="button">
          Confirmar Transferencia
          <svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle;">
            <path d="M21.5 3.5 3 10.5l6.5 2.5M21.5 3.5l-3.6 15.4-5.4-4.4M21.5 3.5 9.5 13l1.4 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </main>

      <!-- SECTION: Bottom Navigation Bar Component Mount -->
      <div id="bottom-nav-container"></div>
    </div>
  `;

  // Attach interactive logic
  initTransferLogic(container);

  // Mount Unified Bottom Navigation Component
  if (typeof BottomNavComponent !== 'undefined') {
    BottomNavComponent.render('#bottom-nav-container', 'transfer');
  }
}

function initTransferLogic(ctx) {
  const $ = (sel) => ctx.querySelector(sel);
  const $$ = (sel) => Array.from(ctx.querySelectorAll(sel));

  const nameEl = $('#recipient-name');
  const ibanEl = $('#recipient-iban');
  const avatar = $('#recipient-avatar');
  const badge = $('#iban-badge');
  const field = $('#amount-field');
  const totalEl = $('#total');
  const confirmBtn = $('#confirmar');
  const conceptoEl = $('#concepto');

  // Recipient name avatar
  if (nameEl && avatar) {
    const updateAvatar = () => {
      const parts = nameEl.value.trim().split(/\s+/).filter(Boolean);
      avatar.textContent = parts.length
        ? (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase()
        : '?';
    };
    nameEl.addEventListener('input', updateAvatar);
    updateAvatar();
  }

  // IBAN validation badge
  if (ibanEl && badge) {
    const validarIban = () => {
      const v = ibanEl.value.replace(/\s+/g, '').toUpperCase();
      const ok = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v);
      badge.hidden = !ok;
      ibanEl.classList.toggle('is-valid', ok);
    };
    ibanEl.addEventListener('input', validarIban);
    validarIban();
  }

  // Amount parsing & total formatting
  const parseAmount = (str) => {
    const clean = String(str).replace(/[^\d.,-]/g, '');
    if (!clean) return 0;
    const n = (clean.includes(',') && clean.includes('.'))
      ? parseFloat(clean.replace(/\./g, '').replace(',', '.'))
      : parseFloat(clean.replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const fmt = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const syncTotal = () => {
    if (totalEl && field) {
      totalEl.textContent = fmt(parseAmount(field.value)) + ' €';
    }
  };

  if (field) {
    field.addEventListener('input', syncTotal);
    field.addEventListener('blur', () => {
      field.value = fmt(parseAmount(field.value));
      syncTotal();
    });
  }

  // Quick amount buttons
  $$('.quick-adds button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!field) return;
      const next = parseAmount(field.value) + (parseFloat(btn.dataset.add) || 0);
      field.value = fmt(next);
      syncTotal();
    });
  });

  // Confirm transfer button
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const amountVal = parseAmount(field ? field.value : '0');
      const recipientName = nameEl ? nameEl.value.trim() : 'Destinatario';
      const conceptVal = conceptoEl ? conceptoEl.value.trim() : 'Transferencia';

      if (amountVal <= 0) {
        if (typeof window.showToast === 'function') {
          window.showToast('Introduce un importe válido', 'error');
        }
        return;
      }

      confirmBtn.classList.add('is-done');
      confirmBtn.textContent = 'Transferencia enviada · ' + fmt(amountVal) + ' €';

      // Insert transaction into database so it appears in history!
      if (typeof TempDB !== 'undefined' && typeof TempDB.insert === 'function') {
        TempDB.insert({
          title: `Transferencia a ${recipientName || 'destinatario'}`,
          subtitle: `${conceptVal || 'Transferencia'} · Hoy`,
          amount: -amountVal,
          type: 'expense',
          category: 'Transferencia',
          accountNumber: ibanEl ? ibanEl.value.trim() : 'ES88 2038 5778 9130 0012 3456',
          date: new Date().toISOString()
        });
      }

      if (typeof window.showToast === 'function') {
        window.showToast(`Transferencia de ${fmt(amountVal)} € enviada con éxito`, 'success');
      }

      setTimeout(() => {
        confirmBtn.classList.remove('is-done');
        confirmBtn.innerHTML = 'Confirmar Transferencia <svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle;"><path d="M21.5 3.5 3 10.5l6.5 2.5M21.5 3.5l-3.6 15.4-5.4-4.4M21.5 3.5 9.5 13l1.4 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }, 2500);
    });
  }

  syncTotal();
}
