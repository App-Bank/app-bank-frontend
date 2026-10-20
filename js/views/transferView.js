function renderTransferView(container) {
  const currentBal = AppState.balance != null ? Number(AppState.balance) : 0;
  const initialBalText = window.formatCurrency(currentBal);

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
              <input class="amount-field" id="amount-field" type="text" inputmode="decimal" placeholder="0,00" aria-label="Importe a enviar" autocomplete="off">
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
            <input class="concepto" id="concepto" type="text" maxlength="60" placeholder="Añade un motivo" aria-label="Concepto de la transferencia">
          </section>

          <section class="card step-card">
            <div class="step-head"><span class="step-num" aria-hidden="true">4</span><h2>Confirmación</h2></div>
            <div class="total-row">
              <span>Total a enviar</span>
              <output id="total" for="amount-field">0,00 €</output>
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

  BottomNavComponent.render(container.querySelector('#bottom-nav-container'), 'transfer');
}

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

  ApiService.getAccount().then(account => {
    if (account && account.balance != null) {
      const balNum = Number(account.balance);
      if (sourceBalanceEl) {
        sourceBalanceEl.textContent = window.formatCurrency(balNum);
      }
      AppState.balance = balNum;
    }
  }).catch(err => {
    console.warn('[TransferView] Failed to fetch source balance from backend:', err);
    if (sourceBalanceEl) {
      sourceBalanceEl.textContent = 'ERROR';
      sourceBalanceEl.style.color = '#f87171';
    }
  });



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
      const ok = /^[A-Z]{2}\d{22}$/.test(v);
      badge.hidden = !ok;
      ibanEl.classList.toggle('is-valid', ok);
    };
    ibanEl.addEventListener('input', validarIban);
    validarIban();
  }

  const parseAmount = (str) => {
    let s = String(str).replace(/[^\d.,]/g, '');
    if (!s) return 0;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');   // "1.500" -> 1500
    const n = parseFloat(s);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
  };

  const syncTotal = () => {
    if (totalEl && field) totalEl.textContent = window.formatCurrency(parseAmount(field.value));
  };

  if (field) {
    const updateFieldWidth = () => {
      if (!window.CSS || !CSS.supports || !CSS.supports('field-sizing', 'content')) {
        field.style.width = Math.max(6, field.value.length + 1) + 'ch';
      }
    };
    field.addEventListener('input', () => {
      updateFieldWidth();
      syncTotal();
    });
    field.addEventListener('blur', () => {
      field.value = fmt(parseAmount(field.value));
      updateFieldWidth();
      syncTotal();
    });
  }

  ctx.querySelectorAll('.quick-adds button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!field) return;
      field.value = fmt(parseAmount(field.value) + (parseFloat(btn.dataset.add) || 0));
      if (!window.CSS || !CSS.supports || !CSS.supports('field-sizing', 'content')) {
        field.style.width = Math.max(6, field.value.length + 1) + 'ch';
      }
      syncTotal();
    });
  });

  const handleTransferSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (confirmBtn && confirmBtn.disabled) return;

    const amountVal = parseAmount(field ? field.value : '0');
    const conceptVal = conceptoEl ? conceptoEl.value.trim() : 'Transferencia';

    if (amountVal <= 0) {
      window.showToast('Introduce un importe válido', 'error');
      return;
    }

    if (AppState.balance != null && amountVal > AppState.balance) {
      window.showToast('Saldo insuficiente', 'error');
      return;
    }

    if (confirmBtn) confirmBtn.disabled = true;
    const rawIban = (ibanEl ? ibanEl.value : '').replace(/\s+/g, '').toUpperCase();

    let recipientAccountId = null;
    try {
      const accounts = await ApiService.getAccounts();
      const matched = (accounts || []).find(a => a.iban && a.iban.replace(/\s+/g, '').toUpperCase() === rawIban);
      if (matched && matched.id != null) recipientAccountId = matched.id;
    } catch (e) {
      console.warn('[TransferView] Accounts lookup failed:', e);
    }

    if (recipientAccountId == null) {
      window.showToast('No encontramos ninguna cuenta con ese IBAN', 'error');
      if (confirmBtn) confirmBtn.disabled = false;
      return;
    }
    if (AppState.accountId != null && Number(recipientAccountId) === Number(AppState.accountId)) {
      window.showToast('No puedes transferir a tu propia cuenta', 'error');
      if (confirmBtn) confirmBtn.disabled = false;
      return;
    }

    if (!recipientAccountId) {
      if (confirmBtn) confirmBtn.disabled = false;
      renderConfirmView(ctx, {
        name: nameEl ? nameEl.value : '',
        amount: amountVal,
        concept: conceptVal,
        error: true,
        message: 'No existe ninguna cuenta con ese IBAN'
      });
      return;
    }

    const maxBal = (typeof AppState !== 'undefined' && AppState.balance != null) ? Number(AppState.balance) : null;
    if (maxBal != null && amountVal > maxBal) {
      if (confirmBtn) confirmBtn.disabled = false;
      renderConfirmView(ctx, {
        name: nameEl ? nameEl.value : '',
        amount: amountVal,
        concept: conceptVal,
        error: true,
        message: `Saldo insuficiente: dispones de ${maxBal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
      });
      return;
    }

    try {
      const created = await ApiService.createTransfer({
        recipient_account_id: recipientAccountId,
        amount: amountVal,
        concept: conceptVal || 'Transferencia',
        timezone_id: 1
      });

      AppState.lastTransfer = {
        recipientName: nameEl ? nameEl.value.trim() : '',
        recipientIban: rawIban,
        amount: amountVal,
        concept: conceptVal || 'Transferencia',
        id: created && created.id != null ? created.id : null
      };
      window.showToast(`Transferencia de ${window.formatCurrency(amountVal)} enviada con éxito`, 'success');
      window.appRouter.navigate('/confirm');
    } catch (err) {
      console.error('[TransferView] Transfer failed:', err);
      window.showToast(`Error: ${err.message}`, 'error');
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