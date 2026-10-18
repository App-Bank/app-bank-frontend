// SECTION: Transfer View
function renderTransferView(container) {
  const currentBal = (typeof AppState !== 'undefined' && AppState.balance != null) ? Number(AppState.balance) : 0;
  const initialBalText = (typeof window.formatCurrency === 'function')
    ? window.formatCurrency(currentBal)
    : `${currentBal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

  container.innerHTML = `
    <div class="aurora" aria-hidden="true"></div>
    <div class="app">
      <header class="app-header" id="top">
        <div class="app-top">
          <a href="#/dashboard" class="app-brand"><span class="logo-mark" aria-hidden="true"></span><span>AURA NEO-BANKING</span></a>
        </div>
        <h1 class="screen-title">Transferir</h1>
        <div class="source-account">
          <p>Desde <strong>Cuenta Corriente</strong></p>
          <p class="source-balance">Disponible <span id="transfer-source-balance">${initialBalText}</span></p>
        </div>
      </header>

      <main class="app-main transfer">
        <form id="transfer-form" class="transfer-form" novalidate>
          <section class="card step-card">
            <div class="step-head"><span class="step-num" aria-hidden="true">1</span><h2>Destinatario</h2></div>
            <div class="recipient">
              <span class="recipient-avatar" id="recipient-avatar" aria-hidden="true">?</span>
              <div class="recipient-fields">
                <input class="field-input" id="recipient-name" type="text" placeholder="Nombre del destinatario" autocomplete="name" aria-label="Nombre del destinatario">
                <span class="iban-field">
                  <input class="field-input" id="recipient-iban" type="text" placeholder="IBAN · ES00 0000 0000 0000 0000 0000" autocomplete="off" spellcheck="false" aria-label="IBAN del destinatario">
                  <span class="valid-badge" id="iban-badge" hidden>Válido</span>
                </span>
              </div>
            </div>
          </section>

          <section class="card step-card">
            <div class="step-head"><span class="step-num" aria-hidden="true">2</span><h2>Importe</h2></div>
            <div class="amount-input">
              <input class="amount-field" id="amount-field" type="text" inputmode="decimal" value="250,00" aria-label="Importe a enviar" autocomplete="off">
              <span class="currency" aria-hidden="true">€</span>
            </div>
            <p class="amount-note">Sin comisiones bancarias</p>
            <div class="quick-adds" role="group" aria-label="Importes rápidos sugeridos">
              <button type="button" data-add="20">+20 €</button>
              <button type="button" data-add="50">+50 €</button>
              <button type="button" data-add="100">+100 €</button>
            </div>
          </section>

          <section class="card step-card">
            <div class="step-head"><span class="step-num" aria-hidden="true">3</span><h2>Concepto</h2></div>
            <input class="concepto" id="concepto" type="text" maxlength="60" placeholder="Añade un motivo" value="Transferencia habitual" aria-label="Concepto de la transferencia">
          </section>

          <section class="card step-card">
            <div class="step-head"><span class="step-num" aria-hidden="true">4</span><h2>Confirmación</h2></div>
            <div class="total-row">
              <span>Total a enviar</span>
              <output id="total" for="amount-field">250,00 €</output>
            </div>
          </section>

          <button class="btn-confirm" id="confirmar" type="submit">
            Confirmar Transferencia
            <svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle;">
              <path d="M21.5 3.5 3 10.5l6.5 2.5M21.5 3.5l-3.6 15.4-5.4-4.4M21.5 3.5 9.5 13l1.4 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </form>
      </main>

      <div id="bottom-nav-container"></div>
    </div>
  `;

  initTransferLogic(container);

  if (typeof BottomNavComponent !== 'undefined') {
    BottomNavComponent.render('#bottom-nav-container', 'transfer');
  }
}

// SECTION: Transfer Form Logic
function initTransferLogic(ctx) {
  const $ = (sel) => ctx.querySelector(sel);
  const transferForm = $('#transfer-form');
  const nameEl = $('#recipient-name');
  const ibanEl = $('#recipient-iban');
  const avatar = $('#recipient-avatar');
  const badge = $('#iban-badge');
  const field = $('#amount-field');
  const totalEl = $('#total');
  const confirmBtn = $('#confirmar');
  const conceptoEl = $('#concepto');
  const sourceBalanceEl = $('#transfer-source-balance');

  const fmt = (n) => window.formatCurrency(n, { noSymbol: true });

  if (typeof ApiService !== 'undefined' && typeof ApiService.getAccount === 'function') {
    ApiService.getAccount(1).then(account => {
      if (account && account.balance != null) {
        const balNum = Number(account.balance);
        if (sourceBalanceEl) {
          sourceBalanceEl.textContent = (typeof window.formatCurrency === 'function') ? window.formatCurrency(balNum) : `${fmt(balNum)} €`;
        }
        if (typeof AppState !== 'undefined') AppState.balance = balNum;
      }
    }).catch(err => {
      console.warn('[TransferView] Failed to fetch source balance from backend:', err);
      if (sourceBalanceEl) {
        sourceBalanceEl.textContent = 'ERROR';
        sourceBalanceEl.style.color = '#f87171';
      }
    });
  }

  if (nameEl && avatar) {
    const updateAvatar = () => {
      const parts = nameEl.value.trim().split(/\s+/).filter(Boolean);
      avatar.textContent = parts.length ? (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase() : '?';
    };
    nameEl.addEventListener('input', updateAvatar);
    updateAvatar();
  }

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

  const parseAmount = (str) => {
    const clean = String(str).replace(/[^\d.,-]/g, '');
    if (!clean) return 0;
    const n = (clean.includes(',') && clean.includes('.'))
      ? parseFloat(clean.replace(/\./g, '').replace(',', '.'))
      : parseFloat(clean.replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const syncTotal = () => {
    if (totalEl && field) totalEl.textContent = fmt(parseAmount(field.value)) + ' €';
  };

  if (field) {
    field.addEventListener('input', syncTotal);
    field.addEventListener('blur', () => {
      field.value = fmt(parseAmount(field.value));
      syncTotal();
    });
  }

  ctx.querySelectorAll('.quick-adds button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!field) return;
      field.value = fmt(parseAmount(field.value) + (parseFloat(btn.dataset.add) || 0));
      syncTotal();
    });
  });

  const handleTransferSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (confirmBtn && confirmBtn.disabled) return;

    const amountVal = parseAmount(field ? field.value : '0');
    const conceptVal = conceptoEl ? conceptoEl.value.trim() : 'Transferencia';

    if (amountVal <= 0) {
      if (typeof window.showToast === 'function') window.showToast('Introduce un importe válido', 'error');
      return;
    }

    if (confirmBtn) confirmBtn.disabled = true;
    const rawIban = (ibanEl ? ibanEl.value : '').replace(/\s+/g, '').toUpperCase();

    let recipientAccountId = 2;
    if (typeof ApiService !== 'undefined' && typeof ApiService.getAccounts === 'function') {
      try {
        const accounts = await ApiService.getAccounts();
        if (Array.isArray(accounts)) {
          const matched = accounts.find(a => a.iban.replace(/\s+/g, '').toUpperCase() === rawIban);
          if (matched) recipientAccountId = matched.id;
        }
      } catch (e) {
        console.warn('[TransferView] Accounts lookup fallback:', e);
      }
    }

    try {
      if (typeof ApiService !== 'undefined' && typeof ApiService.createTransfer === 'function') {
        await ApiService.createTransfer({
          recipient_account_id: recipientAccountId,
          amount: amountVal,
          concept: conceptVal || 'Transferencia',
          timezone_id: 1
        });
      }

      if (confirmBtn) {
        confirmBtn.classList.add('is-done');
        confirmBtn.textContent = `Transferencia enviada · ${fmt(amountVal)} €`;
      }

      if (typeof window.showToast === 'function') {
        window.showToast(`Transferencia de ${fmt(amountVal)} € enviada con éxito`, 'success');
      }

      if (typeof AppState !== 'undefined' && AppState.balance != null) {
        AppState.balance = Math.max(0, AppState.balance - amountVal);
        if (sourceBalanceEl) {
          sourceBalanceEl.textContent = (typeof window.formatCurrency === 'function')
            ? window.formatCurrency(AppState.balance)
            : `${fmt(AppState.balance)} €`;
        }
      }
    } catch (err) {
      console.error('[TransferView] Transfer failed:', err);
      if (typeof window.showToast === 'function') window.showToast(`Error: ${err.message}`, 'error');
    } finally {
      setTimeout(() => {
        if (confirmBtn) {
          confirmBtn.classList.remove('is-done');
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = 'Confirmar Transferencia <svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle;"><path d="M21.5 3.5 3 10.5l6.5 2.5M21.5 3.5l-3.6 15.4-5.4-4.4M21.5 3.5 9.5 13l1.4 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
      }, 2500);
    }
  };

  if (transferForm) {
    transferForm.addEventListener('submit', handleTransferSubmit);
  }

  syncTotal();
}
