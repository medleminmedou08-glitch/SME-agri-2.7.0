(function() {
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const POS_KEY = 'sme_dock_pos';
  const SIZE = 54;

  const createProDock = () => {
    if (document.getElementById('smeMasterDockBtn')) return;

    // ---------- الزر العائم: دائري، يُسحب بحرية، يلتصق بحافة الشاشة ----------
    const btn = document.createElement('button');
    btn.id = 'smeMasterDockBtn';
    btn.setAttribute('aria-label', 'أدوات SME Pro');
    btn.innerHTML = '<span style="font-size:22px; line-height:1;">⚡</span>';
    btn.style.cssText = `position:fixed; z-index:999998; width:${SIZE}px; height:${SIZE}px; border-radius:50%; border:2px solid rgba(255,255,255,.9);
      background:radial-gradient(circle at 30% 25%, #f59e0b 0%, #d97706 45%, #1a3622 130%); color:#fff; display:flex; align-items:center; justify-content:center;
      box-shadow:0 6px 18px rgba(0,0,0,.4); cursor:grab; padding:0; touch-action:none; user-select:none; -webkit-user-select:none;
      transition:opacity .3s, transform .15s; opacity:.92; font-family:inherit;`;
    document.documentElement.appendChild(btn);

    const menu = document.createElement('div');
    menu.id = 'smeMasterMenu';
    menu.style.cssText = 'display:none; position:fixed; z-index:999999; background:#fff; border-radius:18px; padding:10px; width:236px; max-width:calc(100vw - 20px); box-shadow:0 18px 40px rgba(0,0,0,.4); direction:rtl; font-family:inherit; border:1px solid #e2e8f0; color:#1e293b;';
    const items = [
      ['map', '🗺️', 'الخريطة وشبكة الري', '#1e3a8a'],
      ['fert', '🧪', 'الأسمدة وحاسبة الجرعات', '#065f46'],
      ['inv', '🧾', 'الفوترة', '#d97706'],
      ['pro', '📊', 'الإدارة الذكية والأرشيف', '#0f172a'],
      ['ai', '🤖', 'المستشار الذكي', '#1a3622'],
      ['att', '🔑', 'تسجيل الحضور', '#7c3aed'],
      ['bak', '💾', 'نسخة احتياطية الآن', '#475569']
    ];
    menu.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; padding:2px 4px 8px; font-weight:bold; font-size:13px; color:#1a3622;">
        <span>⚡ أدوات SME Pro</span><span id="closeMasterMenu" style="cursor:pointer; color:#94a3b8; padding:0 4px;">✕</span></div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">${items.map(i => `
        <button data-k="${i[0]}" style="background:${i[3]}; color:#fff; border:none; border-radius:12px; padding:10px 6px; font-size:11.5px; font-weight:bold; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; font-family:inherit; line-height:1.3; ${i[0] === 'bak' ? 'grid-column:1/-1; flex-direction:row; justify-content:center;' : ''}">
          <span style="font-size:20px;">${i[1]}</span>${i[2]}</button>`).join('')}</div>
      <div style="font-size:10.5px; color:#94a3b8; text-align:center; margin-top:8px;">اسحب الزر ⚡ إلى أي مكان تريده</div>`;
    document.documentElement.appendChild(menu);

    // ---------- الموضع ----------
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const vw = () => window.innerWidth, vh = () => window.innerHeight;
    let pos = null;
    try { pos = JSON.parse(lsGet(POS_KEY, 'null')); } catch (e) {}
    if (!pos || typeof pos.x !== 'number') pos = { x: vw() - SIZE - 10, y: Math.round(vh() * 0.62) };
    const place = (x, y) => { pos = { x: clamp(x, 6, vw() - SIZE - 6), y: clamp(y, 6, vh() - SIZE - 6) }; btn.style.left = pos.x + 'px'; btn.style.top = pos.y + 'px'; };
    place(pos.x, pos.y);
    window.addEventListener('resize', () => { place(pos.x, pos.y); if (menu.style.display === 'block') placeMenu(); });

    const placeMenu = () => {
      const mw = menu.offsetWidth || 236, mh = menu.offsetHeight || 240;
      let top = pos.y + SIZE + 8; if (top + mh > vh() - 8) top = pos.y - mh - 8;
      top = clamp(top, 8, vh() - mh - 8);
      const left = clamp(pos.x + SIZE / 2 - mw / 2, 8, vw() - mw - 8);
      menu.style.top = top + 'px'; menu.style.left = left + 'px';
    };
    const openMenu = () => { menu.style.display = 'block'; placeMenu(); btn.style.opacity = '1'; };
    const closeMenu = () => { menu.style.display = 'none'; fade(); };

    // يصبح شبه شفاف عند عدم الاستخدام حتى لا يحجب الواجهة
    let fadeT = null;
    const fade = () => { clearTimeout(fadeT); btn.style.opacity = '.92'; fadeT = setTimeout(() => { if (menu.style.display !== 'block') btn.style.opacity = '.4'; }, 3500); };
    fade();

    // ---------- السحب (لمس وفأرة) ----------
    let drag = null;
    btn.addEventListener('pointerdown', (e) => {
      drag = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false };
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      btn.style.cursor = 'grabbing'; btn.style.transition = 'opacity .3s'; btn.style.opacity = '1';
    });
    btn.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) > 6) { drag.moved = true; menu.style.display = 'none'; }
      if (drag.moved) place(drag.ox + dx, drag.oy + dy);
    });
    const endDrag = () => {
      if (!drag) return;
      const moved = drag.moved; drag = null;
      btn.style.cursor = 'grab'; btn.style.transition = 'opacity .3s, transform .15s, left .2s, top .2s';
      if (moved) { // يلتصق بأقرب حافة أفقية
        const toRight = pos.x + SIZE / 2 > vw() / 2;
        place(toRight ? vw() - SIZE - 8 : 8, pos.y);
        lsSet(POS_KEY, JSON.stringify(pos)); fade();
      } else { menu.style.display === 'block' ? closeMenu() : openMenu(); }
    };
    btn.addEventListener('pointerup', endDrag);
    btn.addEventListener('pointercancel', () => { drag = null; });
    document.getElementById('closeMasterMenu').onclick = closeMenu;
    document.addEventListener('pointerdown', (e) => { if (menu.style.display === 'block' && !menu.contains(e.target) && !btn.contains(e.target)) closeMenu(); }, true);

    // ---------- تشغيل الوحدات ----------
    const clickByText = (keywords) => {
      const target = Array.from(document.querySelectorAll('button')).find(b =>
        b !== btn && !menu.contains(b) && keywords.some(k => b.innerText && b.innerText.includes(k)));
      if (target) { target.click(); return true; }
      alert('⚠️ هذه الوحدة غير محمّلة بعد، أعد المحاولة بعد لحظات.');
      return false;
    };
    const actions = {
      map: () => { if (typeof go === 'function') go('map'); },
      fert: () => clickByText(['الأسمدة والتسميد', 'الأسمدة']),
      inv: () => { const b = document.getElementById('smeInvBtn'); if (b) b.click(); else clickByText(['الفوترة', 'Facturation']); },
      pro: () => { const b = document.getElementById('smeProBtn'); if (b) b.click(); else clickByText(['الإدارة الذكية']); },
      ai: () => { const b = document.getElementById('smeAiBtn'); if (b) b.click(); else clickByText(['المساعد الذكي']); },
      att: () => { if (typeof go === 'function') { go('daily'); } },
      bak: () => { if (typeof go === 'function') go('settings'); }
    };
    menu.querySelectorAll('[data-k]').forEach(b => {
      b.onclick = () => {
        closeMenu();
        try { actions[b.dataset.k](); } catch (e) { alert('تعذر فتح الوحدة'); }
        setTimeout(() => { // رفع نوافذ الوحدات فوق الزر
          document.querySelectorAll('body > div').forEach(d => { if (d.style && d.style.position === 'fixed' && d.style.display !== 'none' && d !== menu && d.style.zIndex && +d.style.zIndex < 1000001 && +d.style.zIndex >= 9999) d.style.zIndex = '1000001'; });
        }, 150);
      };
    });

    // إخفاء الأزرار العائمة الفردية للوحدات (الوصول عبر هذا الزر فقط)
    const hideSingles = () => {
      ['smeInvBtn', 'smeProBtn', 'smeAiBtn', 'smeFertBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.style.position === 'fixed') { el.style.opacity = '0'; el.style.pointerEvents = 'none'; el.style.width = '1px'; el.style.height = '1px'; el.style.overflow = 'hidden'; el.style.padding = '0'; el.style.border = '0'; }
      });
    };
    hideSingles(); setInterval(hideSingles, 1500);
  };

  const boot = () => setTimeout(createProDock, 600);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
