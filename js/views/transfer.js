(function () {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initFecha() {
        const el = $('#fecha');
        const mes = $('#mes');
        if (!el && !mes) return;

        const now = new Date();
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        if (el) {
            const texto = now.toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long'
            });
            el.textContent = cap(texto);
        }
        if (mes) {
            el.textContent = cap(now.toLocaleDateString('es-ES', { month: 'long' }));
        }
    }

    function initIban() {
        const btn = $('#toggle-iban');
        const iban = $('#iban');
        if (!btn || !iban) return;
        const completo = 'ES91 2100 0418 4502 0005 4820';

        btn.addEventListener('click', () => {
            const masked = iban.dataset.masked === 'true';
            const mostrar = masked;
            iban.textContent = mostrar ? completo : 'ES91 •••• •••• 4820';
            iban.dataset.masked = String(!mostrar);
            iban.classList.toggle('is-masked', !mostrar);
            btn.setAttribute('aria-pressed', String(mostrar));
            btn.setAttribute('aria-label', mostrar ? 'Ocultar IBAN' : 'Mostrar IBAN');
        });
    }

    function initBalance() {
        const el = $('.balance .whole');
        if (!el) return;

        const raw = el.dataset.counter;
        const target = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
        if (isNaN(target)) return;

        const fmt = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        if (reduceMotion) { el.textContent = fmt(target); return; }

        const duration = 1100;
        const start = performance.now();
        const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(target * eased);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = fmt(target);
        };
        requestAnimationFrame(step);
    }

       function initTabbar() {
        const items = $$('.tabbar-item');
        if (!items.length) return;

        const activate = (item) => items.forEach((i) => i.classList.toggle('is-active', i === item));
        items.forEach((item) => item.addEventListener('click', () => activate(item)));

        const sections = items
            .map((item) => document.getElementById(item.dataset.section))
            .filter(Boolean);

        if (!sections.length || !('IntersectionObserver' in window)) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const item = items.find((i) => i.dataset.section === entry.target.id);
                if (item) activate(item);
            });
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

        sections.forEach((s) => io.observe(s));
    }

    function initRecipient() {
        const nameEl = $('#recipient-name');
        const ibanEl = $('#recipient-iban');
        const avatar = $('#recipient-avatar');
        const badge = $('#iban-badge');

        if (nameEl && avatar) {
            const update = () => {
                const parts = nameEl.value.trim().split(/\s+/).filter(Boolean);
                avatar.textContent = parts.length
                    ? (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase()
                    : '?';
            };
            nameEl.addEventListener('input', update);
            update();
        }

        if (ibanEl && badge) {
            const validar = () => {
                const v = ibanEl.value.replace(/\s+/g, '').toUpperCase();
                const ok = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v);
                badge.hidden = !ok;
                ibanEl.classList.toggle('is-valid', ok);
            };
            ibanEl.addEventListener('input', validar);
            validar();
        }
    }

    
    function initTransfer() {
        const field = $('#amount-field');
        const totalEl = $('#total');
        if (!field || !totalEl) return;

        initRecipient();

        const parseAmount = (str) => {
            const clean = String(str).replace(/[^\d.,-]/g, '');
            if (!clean) return 0;
            const n = (clean.includes(',') && clean.includes('.'))
                ? parseFloat(clean.replace(/\./g, '').replace(',', '.'))
                : parseFloat(clean.replace(',', '.'));
            return isNaN(n) ? 0 : n;
        };
        const fmt = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const syncTotal = () => { totalEl.textContent = fmt(parseAmount(field.value)) + ' €'; };

        field.addEventListener('input', syncTotal);
        field.addEventListener('blur', () => {
            field.value = fmt(parseAmount(field.value));
            syncTotal();
        });

        $$('.quick-adds button').forEach((btn) => {
            btn.addEventListener('click', () => {
                const next = parseAmount(field.value) + (parseFloat(btn.dataset.add) || 0);
                field.value = fmt(next);
                syncTotal();
            });
        });

        const confirm = $('#confirmar');
        if (confirm) {
            confirm.addEventListener('click', () => {
                confirm.classList.add('is-done');
                confirm.textContent = 'Transferencia enviada · ' + fmt(parseAmount(field.value)) + ' €';
                setTimeout(() => {
                    confirm.classList.remove('is-done');
                    confirm.innerHTML = 'Confirmar Transferencia' +
                        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 3.5 3 10.5l6.5 2.5M21.5 3.5l-3.6 15.4-5.4-4.4M21.5 3.5 9.5 13l1.4 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                }, 2200);
            });
        }

        syncTotal();
    }

    function init() {
        initFecha();
        initIban();
        initBalance();
        initTabbar();
        initTransfer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
