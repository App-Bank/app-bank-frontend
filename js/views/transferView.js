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
              <div class="recipient-fields">
                <input class="field-input" id="recipient-name" type="text" placeholder="Nombre del destinatario (automático)" readonly aria-label="Nombre del destinatario" tabindex="-1">
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
            <input class="concepto" id="concepto" type="text" maxlength="60" placeholder="Añade un motivo (obligatorio)" aria-label="Concepto de la transferencia" required>
          </section>

          <section class="card step-card confirmation-card">
            <div class="step-head"><span class="step-num" aria-hidden="true">4</span><h2>Confirmación</h2></div>
            
            <div class="transfer-summary-list" aria-label="Resumen de la transferencia">
              <div class="summary-item">
                <span class="summary-label">Destinatario</span>
                <span class="summary-value" id="summary-recipient">—</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">IBAN destino</span>
                <span class="summary-value summary-iban" id="summary-iban">—</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Concepto</span>
                <span class="summary-value" id="summary-concept">—</span>
              </div>
              <div class="summary-item summary-total-item">
                <span class="summary-label">Total a enviar</span>
                <output id="total" class="summary-total" for="amount-field">0,00 €</output>
              </div>
            </div>

            <div class="confirm-checkbox-wrapper">
              <label class="confirm-checkbox-label" for="confirm-checkbox">
                <input type="checkbox" id="confirm-checkbox" class="confirm-checkbox" aria-required="true">
                <span class="checkbox-text">Confirmo que el IBAN, el importe y el concepto son correctos</span>
              </label>
            </div>
          </section>

          <button class="btn-confirm" id="confirmar" type="submit" disabled aria-disabled="true">
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

  const $ = (sel) => container.querySelector(sel);
  const transferForm = $('#transfer-form');
  const nameEl = $('#recipient-name');
  const ibanEl = $('#recipient-iban');
  const badge = $('#iban-badge');
  const field = $('#amount-field');
  const totalEl = $('#total');
  const confirmBtn = $('#confirmar');
  const confirmCheckbox = $('#confirm-checkbox');
  const conceptoEl = $('#concepto');
  const sourceBalanceEl = $('#transfer-source-balance');

  const summaryRecipient = $('#summary-recipient');
  const summaryIban = $('#summary-iban');
  const summaryConcept = $('#summary-concept');

  let cachedRecipientAccountId = null;
  let cachedRecipientOwnerName = '';
  let lastLookupIban = '';
  let ibanLookupTimer = null;

  const fmt = (n) => window.formatCurrency(n, { noSymbol: true });

  ApiService.getAccount().then(account => {
    if (account && account.balance != null) {
      const balNum = Number(account.balance);
      if (sourceBalanceEl) {
        sourceBalanceEl.textContent = window.formatCurrency(balNum);
      }
    }
  }).catch(err => {
    console.warn('[TransferView] Failed to fetch source balance from backend:', err);
    if (sourceBalanceEl) {
      sourceBalanceEl.textContent = 'ERROR';
      sourceBalanceEl.style.color = '#f87171';
    }
  });

  const parseAmount = (str) => {
    let s = String(str).replace(/[^\d.,]/g, '');
    if (!s) return 0;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    const n = parseFloat(s);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
  };

  const updateSummary = () => {
    const rawIban = ibanEl ? ibanEl.value.replace(/\s+/g, '').toUpperCase() : '';
    const nameVal = nameEl ? nameEl.value.trim() : '';
    const conceptVal = conceptoEl ? conceptoEl.value.trim() : '';
    const amountVal = parseAmount(field ? field.value : '0');

    if (summaryRecipient) summaryRecipient.textContent = nameVal || '—';
    if (summaryIban) summaryIban.textContent = rawIban ? window.formatIban(rawIban) : '—';
    if (summaryConcept) summaryConcept.textContent = conceptVal || '—';
    if (totalEl) totalEl.textContent = window.formatCurrency(amountVal);
  };

  const updateConfirmBtnState = () => {
    const isChecked = Boolean(confirmCheckbox && confirmCheckbox.checked);
    if (confirmBtn) {
      confirmBtn.disabled = !isChecked;
      confirmBtn.setAttribute('aria-disabled', String(!isChecked));
    }
  };

  if (confirmCheckbox) {
    confirmCheckbox.addEventListener('change', updateConfirmBtnState);
    updateConfirmBtnState();
  }

  const performIbanLookup = async (rawIban) => {
    if (!rawIban || rawIban === lastLookupIban) return;
    lastLookupIban = rawIban;

    try {
      const found = await ApiService.getAccountByIban(rawIban);
      if (found && found.id != null) {
        cachedRecipientAccountId = found.id;
        cachedRecipientOwnerName = found.owner_name || '';
        if (nameEl) {
          nameEl.value = found.owner_name || '';
          updateSummary();
        }
      } else {
        cachedRecipientAccountId = null;
        cachedRecipientOwnerName = '';
        if (nameEl) {
          nameEl.value = '';
          updateSummary();
        }
      }
    } catch (_) {
      cachedRecipientAccountId = null;
      cachedRecipientOwnerName = '';
      if (nameEl) {
        nameEl.value = '';
        updateSummary();
      }
    }
  };

  const scheduleIbanLookup = () => {
    if (ibanLookupTimer) clearTimeout(ibanLookupTimer);
    const rawIban = ibanEl ? ibanEl.value.replace(/\s+/g, '').toUpperCase() : '';
    const isFullIban = /^[A-Z]{2}\d{22}$/.test(rawIban);
    if (isFullIban) {
      ibanLookupTimer = setTimeout(() => performIbanLookup(rawIban), 250);
    } else {
      lastLookupIban = '';
      cachedRecipientAccountId = null;
      cachedRecipientOwnerName = '';
      if (nameEl) {
        nameEl.value = '';
        updateSummary();
      }
    }
  };

  if (ibanEl && badge) {
    const validarIban = () => {
      const v = ibanEl.value.replace(/\s+/g, '').toUpperCase();
      const ok = /^[A-Z]{2}\d{22}$/.test(v);
      badge.hidden = !ok;
      ibanEl.classList.toggle('is-valid', ok);
      scheduleIbanLookup();
      updateSummary();
    };
    ibanEl.addEventListener('input', validarIban);
    ibanEl.addEventListener('blur', () => {
      const v = ibanEl.value.replace(/\s+/g, '').toUpperCase();
      if (/^[A-Z]{2}\d{22}$/.test(v)) performIbanLookup(v);
      updateSummary();
    });
    validarIban();
  }

  if (conceptoEl) {
    conceptoEl.addEventListener('input', updateSummary);
  }

  const updateFieldWidth = () => {
    if (field && (!window.CSS?.supports?.('field-sizing', 'content'))) {
      field.style.width = Math.max(6, field.value.length + 1) + 'ch';
    }
  };

  if (field) {
    field.addEventListener('input', () => {
      updateFieldWidth();
      updateSummary();
    });
    field.addEventListener('blur', () => {
      field.value = fmt(parseAmount(field.value));
      updateFieldWidth();
      updateSummary();
    });
  }

  container.querySelectorAll('.quick-adds button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!field) return;
      field.value = fmt(parseAmount(field.value) + (parseFloat(btn.dataset.add) || 0));
      updateFieldWidth();
      updateSummary();
    });
  });

  const handleTransferSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (confirmCheckbox && !confirmCheckbox.checked) {
      window.showToast('Por favor, confirma que el IBAN, el importe y el concepto son correctos', 'error');
      confirmCheckbox.focus();
      return;
    }
    if (confirmBtn && confirmBtn.disabled) return;

    const amountVal = parseAmount(field ? field.value : '0');
    const conceptVal = conceptoEl ? conceptoEl.value.trim() : '';

    if (amountVal <= 0) {
      window.showToast('Introduce un importe válido', 'error');
      if (field) field.focus();
      return;
    }

    if (!conceptVal) {
      window.showToast('El concepto es obligatorio', 'error');
      if (conceptoEl) conceptoEl.focus();
      return;
    }

    if (AppState.balance != null && amountVal > AppState.balance) {
      window.showToast('Saldo insuficiente', 'error');
      return;
    }

    if (confirmBtn) confirmBtn.disabled = true;
    const rawIban = (ibanEl ? ibanEl.value : '').replace(/\s+/g, '').toUpperCase();

    let recipientAccountId = (rawIban === lastLookupIban && cachedRecipientAccountId) ? cachedRecipientAccountId : null;
    let recipientOwnerName = cachedRecipientOwnerName || '';

    if (!recipientAccountId) {
      try {
        const found = await ApiService.getAccountByIban(rawIban);
        if (found && found.id != null) {
          recipientAccountId = found.id;
          recipientOwnerName = found.owner_name || '';
          if (nameEl && !nameEl.value.trim() && found.owner_name) {
            nameEl.value = found.owner_name;
            updateSummary();
          }
        }
      } catch (e) {
        console.warn('[TransferView] Accounts lookup failed:', e);
      }
    }

    if (recipientAccountId == null) {
      window.showToast('No encontramos ninguna cuenta con ese IBAN', 'error');
      updateConfirmBtnState();
      return;
    }
    if (AppState.accountId != null && Number(recipientAccountId) === Number(AppState.accountId)) {
      window.showToast('No puedes transferir a tu propia cuenta', 'error');
      updateConfirmBtnState();
      return;
    }

    try {
      const created = await ApiService.createTransfer({
        recipient_account_id: recipientAccountId,
        amount: amountVal,
        concept: conceptVal || 'Transferencia',
      });

      AppState.lastTransfer = {
        recipientName: (nameEl && nameEl.value.trim()) ? nameEl.value.trim() : (recipientOwnerName || 'Destinatario'),
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
      setTimeout(updateConfirmBtnState, 2500);
    }
  };

  if (transferForm) {
    transferForm.addEventListener('submit', handleTransferSubmit);
  }

  updateSummary();

    BottomNavComponent.render($('#bottom-nav-container'), 'transfer');
}