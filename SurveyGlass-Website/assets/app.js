(() => {
  'use strict';
  const STORE_KEY = 'surveyglass.website.content.v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const defaults = clone(window.SURVEYGLASS_DEFAULT_CONTENT || {});
  let content = defaults;
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) content = mergeDefaults(defaults, JSON.parse(saved));
  } catch (err) { console.warn('Could not load saved site content.', err); }
  function mergeDefaults(base, saved) {
    const merged = clone(base);
    if (!saved || typeof saved !== 'object') return merged;
    ['brand','descriptor','contactEmail','contactPhone','contactLocation'].forEach(k => { if (typeof saved[k] === 'string') merged[k] = saved[k]; });
    if (saved.theme && typeof saved.theme === 'object') merged.theme = {...merged.theme, ...saved.theme};
    if (Array.isArray(saved.sections)) {
      const allowed = new Set(merged.sections.map(s => s.id));
      const used = new Set();
      const reordered = [];
      saved.sections.forEach(s => { if (s && allowed.has(s.id) && !used.has(s.id)) { const baseSection = merged.sections.find(x => x.id === s.id); reordered.push({...baseSection, ...s}); used.add(s.id); } });
      merged.sections.forEach(s => { if (!used.has(s.id)) reordered.push(s); });
      merged.sections = reordered;
    }
    return merged;
  }
  function saveLocal() { try { localStorage.setItem(STORE_KEY, JSON.stringify(content)); } catch (err) { console.warn('Cannot save website editor data in this browser.', err); } }
  function setTheme() {
    const theme = content.theme || {};
    document.documentElement.style.setProperty('--accent', /^#[0-9a-f]{6}$/i.test(theme.accent || '') ? theme.accent : '#7c9dff');
    document.documentElement.style.setProperty('--accent2', /^#[0-9a-f]{6}$/i.test(theme.accent2 || '') ? theme.accent2 : '#67e8d4');
    const root = document.documentElement;
    root.style.setProperty('--glass-blur', `${Math.max(0, Math.min(36, Number(theme.glass) || 22))}px`);
    if (theme.motion === 'off') document.body.classList.add('reduce-motion'); else document.body.classList.remove('reduce-motion');
    document.body.dataset.motion = theme.motion || 'high';
    if (theme.motion === 'subtle') document.body.style.setProperty('--motion-factor', '.45'); else document.body.style.setProperty('--motion-factor', '1');
  }
  const itemIcon = ['⌕','↗','◈','⌘','▤','◷','⌁','✦','▦','↔','◉','◎'];
  const icons = {proof:['◫','◷','▤'], benefits:['⌕','◷','▣','▤','⌁','▦'], features:['⌕','◈','▥','▤','⇄','▧','⌘','◉'], experience:['✧','◈','☼']};
  function sectionHeading(s, center=false) { return `<div class="section-heading ${center?'center':''}"><span class="eyebrow">${escapeHTML(s.eyebrow || '')}</span><h2>${escapeHTML(s.title || '')}</h2>${s.body ? `<p>${escapeHTML(s.body)}</p>` : ''}</div>`; }
  function renderCards(s, type) {
    const items = Array.isArray(s.items) ? s.items : [];
    if (type === 'proof') return `<div class="proof-grid stagger">${items.map((item,i)=>`<article class="proof-card reveal" style="--i:${i}"><div class="proof-mark" aria-hidden="true">${(icons.proof||itemIcon)[i%3]}</div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p></article>`).join('')}</div>`;
    if (type === 'benefits') return `<div class="benefit-grid stagger">${items.map((item,i)=>`<article class="benefit-card reveal" style="--i:${i}"><span class="card-number">0${i+1} / ${String(items.length).padStart(2,'0')}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p></article>`).join('')}</div>`;
    if (type === 'features') return `<div class="feature-grid stagger">${items.map((item,i)=>`<article class="feature-card reveal" style="--i:${i}"><div class="feature-glyph" aria-hidden="true">${(icons.features||itemIcon)[i%8]}</div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p><span class="feature-badge">${escapeHTML(item.badge || 'BUILT FOR THE WORKFLOW')}</span></article>`).join('')}</div>`;
    if (type === 'workflow') return `<div class="steps-grid stagger">${items.map((item,i)=>`<article class="step-card reveal" style="--i:${i}"><div class="step-index">${String(i+1).padStart(2,'0')}</div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p></article>`).join('')}</div>`;
    if (type === 'experience') return `<div class="experience-grid stagger">${items.map((item,i)=>`<article class="experience-card reveal" style="--i:${i}"><div class="experience-symbol">${(icons.experience||itemIcon)[i%3]}</div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p></article>`).join('')}</div>`;
    return '';
  }
  function renderHero(s) {
    const bullets = (s.bullets || []).slice(0,5).map(x=>`<span class="mini-pill">${escapeHTML(x)}</span>`).join('');
    return `<section class="section section-hero" id="hero"><div class="section-inner hero-layout"><div class="hero-copy"><span class="eyebrow">${escapeHTML(s.eyebrow||'')}</span><h1>${escapeHTML(s.title||'')}</h1><p>${escapeHTML(s.body||'')}</p><div class="hero-actions"><a class="button button-primary" href="#benefits">${escapeHTML(s.primaryCta||'Explore benefits')} <span>↘</span></a><a class="button button-secondary" href="#contact">${escapeHTML(s.secondaryCta||'Talk to us')} <span>↗</span></a></div><div class="hero-bullets">${bullets}</div></div><div class="hero-visual" aria-label="Illustrative preview of the SurveyGlass workspace"><div class="orb orb-a"></div><div class="orb orb-b"></div><div class="product-window"><div class="window-top"><div class="window-dots"><i></i><i></i><i></i></div><span class="window-title">SURVEYGLASS / OVERVIEW</span><span>•••</span></div><div class="dashboard-ui"><aside class="mock-sidebar"><div class="mock-logo"><i></i><i></i><i></i><b>SG</b></div><div class="mock-nav-item active">◫ Overview</div><div class="mock-nav-item">⌕ Claims</div><div class="mock-nav-item">₹ Payments</div><div class="mock-nav-item">▥ Reports</div><div class="mock-nav-item">▦ Workshops</div><div class="mock-nav-item">⚙ Settings</div></aside><div class="mock-main"><div class="mock-greeting"><div><h3>Your workspace</h3><p>A clearer view of your survey practice.</p></div><div class="mock-avatar"></div></div><div class="mock-metrics"><div class="mock-metric"><label>CLAIMS TRACKED</label><strong>1,284</strong><small>↗ Your complete register</small></div><div class="mock-metric"><label>FEES RECEIVED</label><strong>₹4.82L</strong><small>◈ Recorded payments</small></div><div class="mock-metric"><label>STILL PENDING</label><strong>₹68.4K</strong><small>◷ Needs follow-up</small></div></div><div class="mock-panel"><div class="mock-panel-head">Fee collection trend <span>MONTHLY VIEW ⌄</span></div><div class="chart-bars">${Array.from({length:7},(_,i)=>`<div class="chart-bar-pair"><i></i><i></i></div>`).join('')}</div><div class="chart-labels"><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span></div></div><div class="mock-bottom-row"><div class="mock-mini-panel"><div class="mini-panel-title">Pending by insurer</div><div class="progress-line"><span>United</span><b><i style="width:78%"></i></b></div><div class="progress-line"><span>National</span><b><i style="width:55%"></i></b></div><div class="progress-line"><span>Oriental</span><b><i style="width:36%"></i></b></div></div><div class="mock-mini-panel"><div class="mini-panel-title">Recent activity</div><div class="progress-line"><span>Claim saved</span><b><i style="width:92%"></i></b></div><div class="progress-line"><span>Fee recorded</span><b><i style="width:68%"></i></b></div><div class="progress-line"><span>Report ready</span><b><i style="width:47%"></i></b></div></div></div></div></div><div class="float-card received"><div class="float-icon">✓</div><div><small>PAYMENT RECORDED</small><strong>Record stays in sync</strong></div></div><div class="float-card pending"><div class="float-icon">◷</div><div><small>SMARTER FOLLOW-UP</small><strong>See what's still due</strong></div></div></div></div></section>`;
  }
  function renderPricing(s) {
    const plans = Array.isArray(s.plans) ? s.plans : [];
    const cards = plans.map(p=>`<article class="plan-card ${p.featured?'featured':''} reveal"><h3>${escapeHTML(p.title||'Plan')}</h3><div class="plan-price">${escapeHTML(p.price||'Contact us')}</div><p class="plan-desc">${escapeHTML(p.description||'')}</p><div class="plan-divider"></div><ul class="plan-features">${(p.features||[]).map(f=>`<li>${escapeHTML(f)}</li>`).join('')}</ul><a class="button ${p.featured?'button-primary':'button-secondary-plan'}" href="#contact">${escapeHTML(p.buttonLabel||'Ask us')} <span>↗</span></a></article>`).join('');
    return `<section class="section section-light" id="pricing"><div class="section-inner">${sectionHeading(s,true)}<div class="plans-grid">${cards}</div><p class="pricing-disclaimer">Plan labels and pricing are editable placeholders. Confirm scope, availability and commercial terms before publishing.</p></div></section>`;
  }
  function renderFaq(s) {
    return `<section class="section section-white" id="faq"><div class="section-inner faq-layout"><div class="faq-title">${sectionHeading(s)}</div><div class="faq-list">${(s.items||[]).map((item,i)=>`<details class="faq-item reveal" ${i===0?'open':''}><summary>${escapeHTML(item.title||'Question')}</summary><div class="faq-answer">${escapeHTML(item.description||'')}</div></details>`).join('')}</div></div></section>`;
  }
  function emailHref(subject='SurveyGlass enquiry') { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.contactEmail||'')) return '#contact'; return `mailto:${encodeURIComponent(content.contactEmail).replace(/%40/g,'@')}?subject=${encodeURIComponent(subject)}`; }
  function renderContact(s) {
    const contactDetails = [content.contactEmail ? `<span>✉ ${escapeHTML(content.contactEmail)}</span>` : '', content.contactPhone ? `<span>☎ ${escapeHTML(content.contactPhone)}</span>` : '', content.contactLocation ? `<span>⌖ ${escapeHTML(content.contactLocation)}</span>` : ''].filter(Boolean).join('');
    return `<section class="section contact-band" id="contact"><div class="section-inner contact-layout"><div class="contact-copy">${sectionHeading(s)}<div class="contact-meta">${contactDetails || '<span>Business contact details can be added in Site Editor</span>'}</div></div><form class="contact-form" id="contactForm"><div class="form-row"><div class="field"><label for="contactName">Your name</label><input id="contactName" name="name" autocomplete="name" required placeholder="Full name"></div><div class="field"><label for="contactEmailInput">Email address</label><input id="contactEmailInput" name="email" type="email" autocomplete="email" required placeholder="you@company.com"></div></div><div class="field"><label for="contactTopic">What would you like to discuss?</label><select id="contactTopic" name="topic"><option>Product walkthrough</option><option>Plans and pricing</option><option>Moving from Excel</option><option>Deployment and data safety</option><option>Something else</option></select></div><div class="field"><label for="contactMessage">A little about your workflow</label><textarea id="contactMessage" name="message" required placeholder="Tell us about your survey work and what you'd like to improve…"></textarea></div><button type="submit" class="button button-primary">${escapeHTML(s.primaryCta||'Contact the team')} <span>↗</span></button><p class="form-privacy">${escapeHTML(s.note||'Your message will open in your email app. No backend is connected in this static website pack.')}</p><p class="form-privacy" id="contactFormStatus" role="status"></p></form></div></section>`;
  }
  function renderSection(s) {
    if (s.visible === false) return '';
    if (s.id === 'hero') return renderHero(s);
    if (s.id === 'proof') return `<section class="section section-white" id="proof"><div class="section-inner">${sectionHeading(s,true)}${renderCards(s,'proof')}</div></section>`;
    if (s.id === 'benefits') return `<section class="section section-feature" id="benefits"><div class="section-inner">${sectionHeading(s)}${renderCards(s,'benefits')}</div></section>`;
    if (s.id === 'features') return `<section class="section section-dark" id="features"><div class="section-inner">${sectionHeading(s,true)}${renderCards(s,'features')}</div></section>`;
    if (s.id === 'workflow') return `<section class="section section-white" id="workflow"><div class="section-inner">${sectionHeading(s)}${renderCards(s,'workflow')}</div></section>`;
    if (s.id === 'experience') return `<section class="section showcase-band" id="experience"><div class="section-inner showcase-layout"><div class="showcase-copy">${sectionHeading(s)}</div>${renderCards(s,'experience')}</div></section>`;
    if (s.id === 'pricing') return renderPricing(s);
    if (s.id === 'faq') return renderFaq(s);
    if (s.id === 'contact') return renderContact(s);
    return '';
  }
  function render() {
    setTheme();
    const container = document.getElementById('dynamicSections');
    container.innerHTML = (content.sections||[]).map(renderSection).join('');
    document.querySelectorAll('.brand-name').forEach(el=>el.textContent=content.brand || 'SurveyGlass');
    document.getElementById('footerBrand').textContent = content.brand || 'SurveyGlass';
    document.getElementById('copyrightBrand').textContent = content.brand || 'SurveyGlass';
    document.getElementById('footerDescriptor').textContent = content.descriptor || '';
    const foot = document.getElementById('footerEmail');
    if (content.contactEmail) { foot.textContent = `${content.contactEmail} ↗`; foot.href = emailHref('Website enquiry'); } else { foot.textContent = 'Contact the team ↗'; foot.href = '#contact'; }
    document.title = `${content.brand || 'SurveyGlass'} — Beyond the Spreadsheet`;
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    setTheme(); bindPageInteractions();
  }
  function toast(message) {
    const region = document.getElementById('toastRegion'); if (!region) return;
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = message; region.appendChild(el); window.setTimeout(()=>el.remove(),3100);
  }
  function bindPageInteractions() {
    const menu = document.getElementById('mobileNav'), menuBtn = document.getElementById('menuToggle');
    if (menu && menuBtn) { menuBtn.onclick = () => { const open = !menu.classList.contains('open'); menu.classList.toggle('open',open); menuBtn.setAttribute('aria-expanded',String(open)); menuBtn.textContent = open ? '×' : '☰'; }; menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='☰';})); }
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
    document.querySelectorAll('.feature-card').forEach(card=>card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',`${e.clientX-r.left}px`);card.style.setProperty('--my',`${e.clientY-r.top}px`);}));
    const form = document.getElementById('contactForm');
    if (form) form.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(form); const email = (content.contactEmail||'').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { const status = document.getElementById('contactFormStatus'); status.textContent = 'The site owner must add a working contact email in Site Editor before this form can send a message.'; toast('Contact email is not configured yet.'); return; }
      const name = String(formData.get('name')||'').trim(), visitorEmail = String(formData.get('email')||'').trim(), topic = String(formData.get('topic')||'General enquiry'), message = String(formData.get('message')||'').trim();
      const body = `Name: ${name}\nReply email: ${visitorEmail}\nTopic: ${topic}\n\nMessage:\n${message}`;
      const safeEmail = encodeURIComponent(email).replace(/%40/g,'@');
      const mailto = `mailto:${safeEmail}?subject=${encodeURIComponent('SurveyGlass website: '+topic)}&body=${encodeURIComponent(body)}`;
      document.getElementById('contactFormStatus').textContent = 'Opening your email application. Please review and send the message there.';
      window.location.href = mailto;
    });
  }
  document.getElementById('themeToggle').addEventListener('click',()=>{document.body.classList.toggle('marketing-light-mode');toast(document.body.classList.contains('marketing-light-mode')?'Light presentation enabled':'Dark presentation restored');});
  window.addEventListener('scroll',()=>{const denom = document.documentElement.scrollHeight - window.innerHeight;document.getElementById('scrollProgress').style.width = `${denom>0?window.scrollY/denom*100:0}%`;document.getElementById('backToTop').classList.toggle('show',window.scrollY>650);},{passive:true});
  document.getElementById('backToTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:document.body.classList.contains('reduce-motion')?'auto':'smooth'}));
  window.SurveyGlassSite = {getContent:()=>clone(content), saveContent:(next)=>{content=mergeDefaults(defaults,next);saveLocal();render();}, reset:()=>{content=clone(defaults);localStorage.removeItem(STORE_KEY);render();}, render, storageKey:STORE_KEY};
  render();
})();
