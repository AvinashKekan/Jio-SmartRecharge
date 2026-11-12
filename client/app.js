(() => {
  'use strict';

  const API = (window.SMARTRECHARGE_API_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');
  const $ = (id) => document.getElementById(id);

  // Additional Jio service plans (Postpaid, JioFiber, JioAirFiber) for complete recharge convenience
  const EXTRA_SERVICE_PLANS = [
    {
      id: 'local-postpaid-349',
      name: 'JioPostpaid 349',
      price: 349,
      validityDays: 30,
      dailyDataGB: null,
      totalDataGB: 30,
      voiceAllowance: 'Unlimited',
      smsAllowance: '100 SMS/day',
      networkType: '5G/4G Postpaid',
      supports5G: true,
      promotionalLabel: 'Postpaid Mobile',
      benefits: ['Unlimited 5G data in 5G areas', 'No daily data cap (30 GB rollover)', 'JioTV & JioCloud'],
      notes: [{ text: 'Monthly postpaid billing cycle with carry-forward data.' }],
      category: { name: 'Postpaid Mobile', slug: 'postpaid' },
      isLocalService: true
    },
    {
      id: 'local-postpaid-649',
      name: 'JioPostpaid Family 649',
      price: 649,
      validityDays: 30,
      dailyDataGB: null,
      totalDataGB: 75,
      voiceAllowance: 'Unlimited',
      smsAllowance: '100 SMS/day',
      networkType: '5G/4G Postpaid',
      supports5G: true,
      promotionalLabel: 'Postpaid Family',
      benefits: ['Up to 3 add-on family SIMs supported', '75 GB monthly data + Unlimited 5G', 'JioTV & JioCinema'],
      notes: [{ text: 'Ideal for families sharing one monthly bill.' }],
      category: { name: 'Postpaid Mobile', slug: 'postpaid' },
      isLocalService: true
    },
    {
      id: 'local-fiber-399',
      name: 'JioFiber 30 Mbps',
      price: 399,
      validityDays: 30,
      dailyDataGB: null,
      totalDataGB: 3300,
      voiceAllowance: 'Unlimited Landline',
      smsAllowance: 'Not applicable',
      networkType: 'Home Fiber (30 Mbps)',
      supports5G: false,
      promotionalLabel: 'JioFiber Broadband',
      benefits: ['30 Mbps unlimited home Wi-Fi', 'Free landline voice calling', 'Stable speed for work & study'],
      notes: [{ text: 'Monthly home broadband plan (GST extra as applicable).' }],
      category: { name: 'JioFiber & AirFiber', slug: 'fiber' },
      isLocalService: true
    },
    {
      id: 'local-airfiber-599',
      name: 'JioAirFiber 30 Mbps + OTT',
      price: 599,
      validityDays: 30,
      dailyDataGB: null,
      totalDataGB: 1000,
      voiceAllowance: 'Unlimited Landline',
      smsAllowance: 'Not applicable',
      networkType: '5G AirFiber (30 Mbps)',
      supports5G: true,
      promotionalLabel: 'JioAirFiber + 12 OTTs',
      benefits: ['30 Mbps wireless home broadband', '800+ Live TV channels', '12 popular OTT apps included'],
      notes: [{ text: 'Plug-and-play 5G home Wi-Fi with TV & OTT bundle.' }],
      category: { name: 'JioFiber & AirFiber', slug: 'fiber' },
      isLocalService: true
    },
    {
      id: 'local-fiber-999',
      name: 'JioFiber 150 Mbps + OTT',
      price: 999,
      validityDays: 30,
      dailyDataGB: null,
      totalDataGB: 3300,
      voiceAllowance: 'Unlimited Landline',
      smsAllowance: 'Not applicable',
      networkType: 'Home Fiber (150 Mbps)',
      supports5G: false,
      promotionalLabel: 'High-Speed Fiber',
      benefits: ['150 Mbps symmetric fiber speed', '14+ OTT subscriptions included', 'Ideal for 4K streaming & gaming'],
      notes: [{ text: 'High-speed home broadband with bundled entertainment.' }],
      category: { name: 'JioFiber & AirFiber', slug: 'fiber' },
      isLocalService: true
    }
  ];

  const state = {
    plans: [],
    filtered: [],
    category: 'all',
    compare: [],
    user: null,
    page: 1,
    size: 9,
    selected: null
  };

  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const money = (n, decimals = 0) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(Number(n) || 0);

  const metric = (p) => {
    const total =
      p.totalDataGB != null
        ? Number(p.totalDataGB)
        : p.dailyDataGB != null
          ? Number(p.dailyDataGB) * Number(p.validityDays)
          : null;
    const days = Math.max(1, Number(p.validityDays));
    return {
      total,
      daily: Number(p.price) / days,
      gb: total > 0 ? Number(p.price) / total : null,
      monthly: (Number(p.price) * 30) / days
    };
  };

  async function api(path, opts = {}) {
    const r = await fetch(API + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw Error(d.error || `Request failed (${r.status})`);
    return d;
  }

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function open(html) {
    $('modalBody').innerHTML = html;
    $('modal').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    $('modal').hidden = true;
    document.body.style.overflow = '';
  }

  function catSlug(p) {
    const slug = p.category?.slug || 'popular';
    return { '5g': 'true-5g', data: 'data-packs', roaming: 'international-roaming' }[slug] || slug;
  }

  function cardBadge(p) {
    const raw = (p.promotionalLabel || '').trim();
    if (raw && !/demo|illustrative|sample/i.test(raw)) return raw;
    if (p.validityDays >= 300) return 'Annual Value Plan';
    if (p.supports5G) return 'True 5G Unlimited';
    return p.category?.name || 'Jio Prepaid';
  }

  function render() {
    const q = $('search').value.trim().toLowerCase();
    const minRaw = Math.max(0, Math.min(100000, Number($('minPrice').value) || 0));
    const maxRaw = Math.max(0, Math.min(100000, Number($('maxPrice').value) || 100000));
    const min = Math.min(minRaw, maxRaw);
    const max = Math.max(minRaw, maxRaw);

    const arr = state.plans.filter((p) => {
      const text = [
        p.name,
        p.promotionalLabel,
        p.terms,
        p.category?.name,
        p.voiceAllowance,
        p.smsAllowance,
        p.networkType,
        ...(Array.isArray(p.benefits) ? p.benefits : [])
      ]
        .join(' ')
        .toLowerCase();
      const slug = catSlug(p);
      const c = state.category;
      const ok =
        c === 'all' ||
        (c === 'annual'
          ? slug === 'annual' || p.validityDays >= 300
          : c === 'popular'
            ? slug === 'popular' || p.isPopular
            : c === 'true-5g'
              ? p.supports5G
              : slug === c);

      return (!q || text.includes(q)) && ok && p.price >= min && p.price <= max && (!$('only5g').checked || p.supports5G);
    });

    const s = $('sort').value;
    arr.sort((a, b) =>
      s === 'price-desc'
        ? b.price - a.price
        : s === 'validity'
          ? b.validityDays - a.validityDays
          : s === 'data'
            ? (b.totalDataGB ?? (b.dailyDataGB || 0) * b.validityDays) -
              (a.totalDataGB ?? (a.dailyDataGB || 0) * a.validityDays)
            : a.price - b.price
    );

    state.filtered = arr;
    state.page = 1;
    draw();
  }

  function draw() {
    const start = (state.page - 1) * state.size;
    const items = state.filtered.slice(start, start + state.size);

    $('count').textContent = `${state.filtered.length} plans available`;
    $('empty').hidden = items.length > 0;
    $('plans').innerHTML = items.map(card).join('');
    $('pages').innerHTML = Array.from(
      { length: Math.ceil(state.filtered.length / state.size) },
      (_, i) => `<button class="page ${state.page === i + 1 ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>`
    ).join('');
    $('compareCount').textContent = `${state.compare.length} / 3 selected`;
    drawCompare();
  }

  function card(p) {
    const m = metric(p);
    const data =
      p.dailyDataGB != null
        ? `${p.dailyDataGB} GB/day`
        : p.totalDataGB != null
          ? `${p.totalDataGB} GB`
          : 'As per plan';
    const perGb = m.gb == null ? '—' : `${money(m.gb, 2)}/GB`;

    return `<article class="plan-card">
      <div class="card-top">
        <span class="ribbon">${esc(cardBadge(p))}</span>
        <b class="true5g ${p.supports5G ? '' : 'std'}">${p.supports5G ? 'TRUE5G' : esc(p.category?.slug === 'fiber' ? 'FIBER' : '4G')}</b>
      </div>
      <div class="price-row">
        <div class="price">${money(p.price)}</div>
        <span class="per-day">${esc(money(m.daily, 2))} / day</span>
      </div>
      <div class="plan-name">${esc(p.name)}</div>
      <div class="specs">
        <div><small>Validity</small><b>${esc(p.validityDays)} Days</b></div>
        <div><small>Data</small><b>${esc(data)}</b></div>
        <div><small>Calls</small><b>${/unlimited/i.test(p.voiceAllowance || '') ? 'Unlimited' : 'Included'}</b></div>
      </div>
      <div class="card-transparency">
        <span>Monthly: <strong>${esc(money(m.monthly))}</strong></span>
        <span>Per GB: <strong>${esc(perGb)}</strong></span>
      </div>
      <div class="actions">
        <button class="primary" data-detail="${esc(p.id)}">Buy / Details</button>
        <button class="outline" data-compare="${esc(p.id)}">${state.compare.includes(p.id) ? 'Added ✓' : 'Compare'}</button>
      </div>
    </article>`;
  }

  function drawCompare() {
    const ps = state.compare.map((id) => state.plans.find((p) => p.id === id)).filter(Boolean);
    if (!ps.length) {
      $('comparison').innerHTML = 'Tap Compare on any plan card to see them side by side.';
      return;
    }

    const rows = [
      ['Plan price', (p) => money(p.price)],
      ['Daily cost', (p) => `${money(metric(p).daily, 2)} / day`],
      ['Monthly cost (30 days)', (p) => money(metric(p).monthly)],
      ['Validity', (p) => `${p.validityDays} days`],
      ['Total data', (p) => (metric(p).total == null ? 'Not specified' : `${metric(p).total} GB`)],
      ['Daily data', (p) => (p.dailyDataGB == null ? 'No daily cap' : `${p.dailyDataGB} GB / day`)],
      ['Cost per GB', (p) => (metric(p).gb == null ? 'N/A' : `${money(metric(p).gb, 2)} / GB`)],
      ['Network', (p) => (p.supports5G ? 'True 5G' : p.networkType || '4G')]
    ];

    $('comparison').innerHTML = `<table class="compare-table">
      <thead>
        <tr>
          <th>Metric</th>
          ${ps.map((p) => `<th>${esc(p.name)}<button data-remove="${esc(p.id)}">Remove</button></th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(([k, fn]) => `<tr><td>${k}</td>${ps.map((p) => `<td>${esc(fn(p))}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>`;
  }

  function toggleCompare(id) {
    if (state.compare.includes(id)) {
      state.compare = state.compare.filter((x) => x !== id);
    } else if (state.compare.length < 3) {
      state.compare.push(id);
    } else {
      return toast('You can compare up to 3 plans.');
    }
    draw();
  }

  function details(id) {
    const p = state.plans.find((x) => x.id === id);
    if (!p) return;

    state.selected = p;
    const m = metric(p);
    const benefits = Array.isArray(p.benefits) ? p.benefits.filter(Boolean) : [];
    const notes = Array.isArray(p.notes)
      ? p.notes.map((n) => (typeof n === 'string' ? n : n.text || '')).filter(Boolean)
      : [];

    open(`<b class="eyebrow">JIO PLAN BREAKDOWN</b>
      <h2>${esc(p.name)}</h2>
      <p class="muted">${esc(p.category?.name || 'Jio Plan')} · ${p.supports5G ? 'True 5G ready' : esc(p.networkType || '4G network')}</p>
      <div class="modal-price">${money(p.price)} <span class="per-day">${esc(money(m.daily, 2))} / day</span></div>
      <div class="spec-grid">${[
        ['Validity', `${p.validityDays} days`],
        ['Total data', m.total == null ? 'Not specified' : `${m.total} GB`],
        ['Daily data', p.dailyDataGB == null ? 'No daily cap' : `${p.dailyDataGB} GB / day`],
        ['Calling', p.voiceAllowance],
        ['SMS', p.smsAllowance],
        ['Network', p.networkType],
        ['Daily cost', `${money(m.daily, 2)} / day`],
        ['Cost per GB', m.gb == null ? 'N/A' : `${money(m.gb, 2)} / GB`],
        ['Monthly cost (30 days)', money(m.monthly)]
      ]
        .map(([k, v]) => `<div class="spec"><small>${esc(k)}</small><b>${esc(v)}</b></div>`)
        .join('')}</div>
      ${benefits.length ? `<h3>Included benefits</h3><ul>${benefits.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      ${notes.length ? `<h3>Plan details</h3><ul>${notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      <div class="modal-actions">
        <button class="outline" id="modalCompare">${state.compare.includes(id) ? 'Remove comparison' : 'Compare plan'}</button>
        <button class="primary" id="modalBuy">Proceed to recharge →</button>
      </div>`);

    $('modalCompare').onclick = () => {
      toggleCompare(id);
      $('modalCompare').textContent = state.compare.includes(id) ? 'Remove comparison' : 'Compare plan';
    };
    $('modalBuy').onclick = () => checkout(p);
  }

  function checkout(p) {
    if (!state.user) {
      close();
      toast('Sign in to continue your recharge.');
      account('login');
      return;
    }

    const m = metric(p);
    open(`<b class="eyebrow">JIO SMARTRECHARGE CHECKOUT</b>
      <h2>Complete recharge</h2>
      <p class="muted">${esc(p.name)} · ${p.validityDays} days · ${esc(money(m.daily, 2))} / day</p>
      <div class="modal-price">${money(p.price)}</div>
      <form id="payForm" class="stack" novalidate>
        <label>10-digit Jio mobile or service number
          <input id="mobile" type="tel" inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" required placeholder="9876543210">
        </label>
        <label>Payment method
          <select id="method">
            <option value="UPI">UPI</option>
            <option value="CARD">Debit / Credit Card</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="WALLET">JioPay / Wallet</option>
          </select>
        </label>
        <p id="payError" class="error"></p>
        <button class="primary full">Pay ${money(p.price)}</button>
      </form>`);

    $('mobile').oninput = (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    };

    $('payForm').onsubmit = async (e) => {
      e.preventDefault();
      const mobile = $('mobile').value;
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        $('payError').textContent = 'Enter a valid 10-digit Indian mobile number.';
        return;
      }

      const b = e.submitter;
      b.disabled = true;
      b.textContent = 'Processing…';

      if (p.isLocalService) {
        const ref = `JIO-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        open(`<div class="success">
          <div>✓</div>
          <h2>Recharge successful</h2>
          <p>Your ${esc(p.name)} plan for ${esc(mobile)} is confirmed.</p>
          <b>Reference: ${esc(ref)}</b>
          <button class="primary full" id="done">Done</button>
        </div>`);
        $('done').onclick = close;
        return;
      }

      try {
        const r = await api('/recharges/simulate', {
          method: 'POST',
          body: JSON.stringify({
            planId: p.id,
            mobileNumber: mobile,
            paymentMethod: $('method').value,
            outcome: 'SUCCESS'
          })
        });
        open(`<div class="success">
          <div>✓</div>
          <h2>Recharge successful</h2>
          <p>Your ${esc(p.name)} plan for ${esc(mobile)} has been saved to Recharge history.</p>
          <b>Reference: ${esc(r.transaction?.reference || 'CONFIRMED')}</b>
          <button class="primary full" id="done">Done</button>
        </div>`);
        $('done').onclick = close;
      } catch (err) {
        $('payError').textContent = err.message;
        b.disabled = false;
        b.textContent = `Pay ${money(p.price)}`;
      }
    };
  }

  function openProfile() {
    const initial = esc((state.user.name || state.user.email || 'J').trim().charAt(0).toUpperCase());
    open(`<b class="eyebrow">MY JIO PROFILE</b>
      <h2>Account</h2>
      <div class="profile-card">
        <div class="profile-avatar">${initial}</div>
        <div>
          <strong>${esc(state.user.name || 'Jio Customer')}</strong>
          <small>${esc(state.user.email || '')}</small>
        </div>
      </div>
      <div class="modal-actions">
        <button class="outline" id="profileHistory">Recharge history</button>
        <button class="primary" id="profileLogout">Sign out</button>
      </div>`);

    $('profileHistory').onclick = history;
    $('profileLogout').onclick = async () => {
      try {
        await api('/auth/logout', { method: 'POST', body: '{}' });
      } catch (_) {}
      state.user = null;
      accountLabel();
      close();
      toast('Signed out.');
    };
  }

  function account(mode = 'login') {
    open(`<b class="eyebrow">MY JIO ACCOUNT</b>
      <h2>${mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
      <p class="muted">Save your recharge history and plan preferences.</p>
      <form id="accountForm" class="stack" novalidate>
        ${mode === 'register' ? '<label>Your name<input id="name" maxlength="80" minlength="2" required></label>' : ''}
        <label>Email address<input id="email" type="email" maxlength="254" required></label>
        <label>Password (10–100 characters)<input id="password" type="password" minlength="10" maxlength="100" required></label>
        <p id="accountError" class="error"></p>
        <button class="primary full">${mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <button class="switch" id="switchAccount">${mode === 'login' ? 'New here? Create an account' : 'Already registered? Sign in'}</button>`);

    $('switchAccount').onclick = () => account(mode === 'login' ? 'register' : 'login');

    $('accountForm').onsubmit = async (e) => {
      e.preventDefault();
      const email = $('email').value.trim();
      const password = $('password').value;
      const name = $('name')?.value.trim();

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        password.length < 10 ||
        password.length > 100 ||
        (mode === 'register' && (!name || name.length < 2 || name.length > 80))
      ) {
        $('accountError').textContent = 'Check your details and password length.';
        return;
      }

      const b = e.submitter;
      b.disabled = true;

      try {
        const r = await api(`/auth/${mode}`, {
          method: 'POST',
          body: JSON.stringify({ email, password, ...(mode === 'register' ? { name } : {}) })
        });
        state.user = r.user;
        accountLabel();
        close();
        toast(`Welcome${state.user.name ? ', ' + state.user.name : ''}!`);
      } catch (err) {
        $('accountError').textContent = err.message;
        b.disabled = false;
      }
    };
  }

  function accountLabel() {
    const btn = $('accountBtn');
    if (state.user) {
      const initial = esc((state.user.name || state.user.email || 'J').trim().charAt(0).toUpperCase());
      btn.classList.add('signed-in');
      btn.title = `${state.user.name || state.user.email} · View profile`;
      btn.innerHTML = initial;
    } else {
      btn.classList.remove('signed-in');
      btn.title = 'Sign in / Profile';
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.14 0-7.5 2.02-7.5 4.5V20h15v-1.25c0-2.48-3.36-4.5-7.5-4.5Z"/>
      </svg>`;
    }
  }

  async function history() {
    if (!state.user) {
      toast('Sign in to view recharge history.');
      account();
      return;
    }

    open('<b class="eyebrow">MY JIO ACCOUNT</b><h2>Recharge history</h2><p>Loading…</p>');

    try {
      const rows = await api('/recharges/history');
      $('modalBody').innerHTML = `<b class="eyebrow">MY JIO ACCOUNT</b>
        <h2>Recharge history</h2>
        <p class="muted">Your recent recharges.</p>
        ${
          rows.length
            ? rows
                .map(
                  (t) => `<div class="history-row">
                    <div><b>${esc(t.plan?.name || 'Recharge plan')}</b><small>${esc(t.mobileNumber)} · ${new Date(t.createdAt).toLocaleDateString('en-IN')}</small></div>
                    <b>${money(t.amount)}<small>${esc(t.status)}</small></b>
                  </div>`
                )
                .join('')
            : '<div class="compare-empty">No recharges yet.</div>'
        }`;
    } catch (e) {
      $('modalBody').innerHTML = `<h2>Recharge history</h2><p class="error">${esc(e.message)}</p>`;
    }
  }

  async function recommendations(e) {
    e.preventDefault();
    const daily = Number($('daily').value);
    const budget = Number($('budget').value);
    const validity = Number($('validity').value);

    if (!Number.isFinite(daily) || daily < 0.1 || daily > 100 || !Number.isInteger(budget) || budget < 1 || budget > 100000) {
      $('recommendError').textContent = 'Daily usage: 0.1–100 GB. Budget: ₹1–₹100,000.';
      return;
    }

    const b = $('recommendSubmit');
    b.disabled = true;
    $('recommendError').textContent = '';

    try {
      const d = await api('/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          dailyUsageGB: daily,
          monthlyBudget: budget,
          preferredValidity: validity,
          requires5G: $('need5g').checked
        })
      });

      $('recommendations').innerHTML =
        (d.results || [])
          .slice(0, 3)
          .map(
            (r, i) => `<div class="recommend-row">
              <div><b>${i === 0 ? 'Best match · ' : ''}${esc(r.plan?.name || 'Recommended plan')}</b><small>${esc(r.reason || 'Matches your selected usage and budget.')}</small></div>
              <b>${esc(r.score)}/100</b>
            </div>`
          )
          .join('') || '<p class="muted">No close matches. Try increasing your budget.</p>';
    } catch (err) {
      $('recommendError').textContent = err.message;
    } finally {
      b.disabled = false;
    }
  }

  async function init() {
    $('year').textContent = new Date().getFullYear();
    $('closeModal').onclick = close;
    $('modal').onclick = (e) => {
      if (e.target === $('modal')) close();
    };
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    $('search').oninput = render;
    $('sort').onchange = render;
    ['minPrice', 'maxPrice', 'only5g'].forEach((id) => {
      $(id).onchange = render;
    });

    $('filterBtn').onclick = () => {
      $('filters').hidden = !$('filters').hidden;
    };

    $('reset').onclick = () => {
      $('search').value = '';
      $('minPrice').value = 0;
      $('maxPrice').value = 5000;
      $('only5g').checked = false;
      state.category = 'all';
      document.querySelectorAll('.cat').forEach((x) => x.classList.toggle('active', x.dataset.cat === 'all'));
      render();
    };

    $('categories').onclick = (e) => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      state.category = b.dataset.cat;
      document.querySelectorAll('.cat').forEach((x) => x.classList.toggle('active', x === b));
      render();
    };

    document.querySelector('.subnav').onclick = (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      document.querySelectorAll('.subnav a').forEach((x) => x.classList.toggle('active', x === a));
      if (a.dataset.cat || a.getAttribute('href') === '#catalogue') {
        state.category = a.dataset.cat || 'all';
        document.querySelectorAll('.cat').forEach((x) => x.classList.toggle('active', x.dataset.cat === state.category));
        render();
      }
    };

    $('plans').onclick = (e) => {
      const b = e.target.closest('[data-detail],[data-compare]');
      if (!b) return;
      b.dataset.detail ? details(b.dataset.detail) : toggleCompare(b.dataset.compare);
    };

    $('pages').onclick = (e) => {
      const b = e.target.closest('[data-page]');
      if (b) {
        state.page = Number(b.dataset.page);
        draw();
      }
    };

    $('comparison').onclick = (e) => {
      const b = e.target.closest('[data-remove]');
      if (b) toggleCompare(b.dataset.remove);
    };

    $('recommendForm').onsubmit = recommendations;

    $('accountBtn').onclick = () => (state.user ? openProfile() : account('login'));

    $('historyBtn').onclick = () => {
      document.querySelector('.header').classList.remove('mobile-open');
      history();
    };

    $('menuBtn').onclick = () => document.querySelector('.header').classList.toggle('mobile-open');
    document.querySelector('.header nav').onclick = (e) => {
      if (e.target.closest('a')) document.querySelector('.header').classList.remove('mobile-open');
    };

    [
      ['daily', 0.1, 100],
      ['budget', 1, 100000],
      ['minPrice', 0, 100000],
      ['maxPrice', 0, 100000]
    ].forEach(([id, _min, max]) =>
      $(id).addEventListener('input', (e) => {
        if (e.target.value === '') return;
        const n = Number(e.target.value);
        if (!Number.isFinite(n)) e.target.value = '';
        else if (n > max) e.target.value = max;
        else if (n < 0) e.target.value = 0;
      })
    );

    try {
      const me = await api('/auth/me');
      state.user = me.user;
    } catch (_) {}
    accountLabel();

    try {
      const d = await api('/plans?limit=50&sort=price-asc');
      const dbPlans = d.items || [];
      const existingNames = new Set(dbPlans.map((p) => p.name.toLowerCase()));
      state.plans = [...dbPlans, ...EXTRA_SERVICE_PLANS.filter((p) => !existingNames.has(p.name.toLowerCase()))];
      render();
    } catch (err) {
      $('plans').innerHTML = `<div class="loading">Could not load plans: ${esc(err.message)}. Check API and database settings.</div>`;
      $('count').textContent = 'Catalogue unavailable';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();