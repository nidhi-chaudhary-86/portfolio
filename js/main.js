/**
 * main.js — Nidhi Chaudhary Portfolio
 *
 * Fetches data/portfolio.json and builds the entire page dynamically.
 * Sections: Nav · Hero · Skills Ticker · Education · Experience · Skills Grid · Patents · Projects · Achievements · Contact · Footer
 */

/* ═══════════════════════════════════════════
   BOOT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  fetch('../data/portfolio.json')
    .then(r => {
      if (!r.ok) throw new Error(`Could not load portfolio.json (${r.status})`);
      return r.json();
    })
    .then(data => {
      buildNav(data.meta);
      buildHero(data.meta);
      buildMarquee(data.skills);
      buildEducation(data.education);
      buildExperience(data.experience);
      buildSkillsGrid(data.skills_detail);
      buildPatents(data.patents, data.meta.social.scholar);
      buildProjects(data.projects);
      buildAchievements(data.achievements);
      buildContact(data.meta);
      buildFooter(data.meta);

      initCursor();
      initScrollReveal();
      initActiveNav();
    })
    .catch(err => {
      console.error('Portfolio data error:', err);
      document.body.innerHTML = `
        <p style="color:#ff5c35;padding:40px;font-family:monospace;font-size:1rem">
          ⚠ ${err.message}<br/><small>Make sure portfolio.json is in the data/ folder.</small>
        </p>`;
    });
});

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const $ = id => document.getElementById(id);

function el(tag, className = '', html = '') {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html) e.innerHTML = html;
  return e;
}

function makeSection(id, extraClass = '') {
  const s = document.createElement('section');
  s.id = id;
  s.className = ['section', extraClass].filter(Boolean).join(' ');
  return s;
}

function sectionHeader(num, label, title, accentWord, sub = '') {
  return `
    <div class="section-eyebrow">
      <span class="section-eyebrow-text">${num} / ${label}</span>
      <div class="section-eyebrow-line"></div>
    </div>
    <h2 class="section-heading">${title} <em>${accentWord}</em></h2>
    ${sub ? `<p class="section-sub">${sub}</p>` : ''}
  `;
}

/**
 * Groups consecutive experience entries by company name so same-company
 * roles are visually nested under one company header.
 */
function groupExperienceByCompany(experience) {
  const groups = [];
  experience.forEach(exp => {
    const last = groups[groups.length - 1];
    if (last && last.company === exp.company) {
      last.roles.push(exp);
    } else {
      groups.push({ company: exp.company, emoji: exp.emoji, roles: [exp] });
    }
  });
  return groups;
}

/** Project image placeholder when no image path is set or image fails to load */
function projectPlaceholder(title) {
  // Generate a simple gradient placeholder using the title's char code as seed
  const hue = title.charCodeAt(0) * 17 % 360;
  return `
    <div class="proj-img-placeholder" style="background: linear-gradient(135deg, hsl(${hue},40%,10%), hsl(${hue + 40},50%,18%))">
      <span>${title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
    </div>
  `;
}

/* ═══════════════════════════════════════════
   NAV
═══════════════════════════════════════════ */
function buildNav({ name }) {
  const initials = name.split(' ').map(w => w[0]).join('');
  $('navbar').innerHTML = `
    <a class="nav-logo" href="#hero">${initials}<span>.</span></a>
    <ul class="nav-links">
      <li><a href="#hero">Home</a></li>
      <li><a href="#education">Education</a></li>
      <li><a href="#experience">Experience</a></li>
      <li><a href="#skills">Skills</a></li>
      <li><a href="#patents">Patents</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  `;
}

/* ═══════════════════════════════════════════
   HERO
═══════════════════════════════════════════ */
function buildHero({ name, title, tagline, email, resume, available, social, stats }) {
  const section = $('hero');
  const [first, ...rest] = name.split(' ');
  const last = rest.join(' ');
  const mid = Math.ceil(last.length / 2);
  const lastA = last.slice(0, mid);
  const lastB = last.slice(mid);

  // Only show badge if available; show current role otherwise
  const badgeHTML = available
    ? `<div class="hero-badge">Available for Opportunities</div>`
    : `<div class="hero-badge hero-badge--role">● ${title}</div>`;

  section.innerHTML = `
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="hero-left">
      ${badgeHTML}
      <h1 class="hero-name">${first}<br/><em>${lastA}-</em><br/>${lastB}</h1>
      <p class="hero-desc">${tagline}</p>
      <div class="hero-actions">
        <a href="#projects" class="btn btn-primary">See My Work ↓</a>
        <a href="${resume}" target="_blank" rel="noopener" class="btn btn-ghost">Download CV ↗</a>
      </div>
    </div>

    <div class="hero-right">
      <div class="profile-card">
        <div class="float-chip chip-role">💼 ${title}</div>
        <div class="float-chip chip-loc">📍 San Francisco, CA</div>
        <div class="profile-inner">
          <img class="profile-img"
               src="images/profile.jpg"
               alt="${name}"
               onerror="this.style.display='none'"/>
          <div class="profile-name">${name}</div>
          <div class="profile-subtitle">${title}</div>
          <div class="stats-row">
            ${stats.map(s => `
              <div class="stat-cell">
                <div class="stat-val">${s.value}</div>
                <div class="stat-lbl">${s.label}</div>
              </div>
            `).join('')}
          </div>
          <div class="social-row">
            <a class="social-btn" href="${social.linkedin}" target="_blank" rel="noopener" title="LinkedIn">in</a>
            <a class="social-btn" href="${social.github}"   target="_blank" rel="noopener" title="GitHub">gh</a>
            <a class="social-btn" href="${social.scholar}"  target="_blank" rel="noopener" title="Google Scholar">GS</a>
            <a class="social-btn" href="mailto:${email}" title="Email">✉</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════
   MARQUEE
═══════════════════════════════════════════ */
function buildMarquee(skills) {
  const items = [...skills, ...skills]
    .map(s => `<div class="marquee-item">${s} <span class="dot">★</span></div>`)
    .join('');
  $('marquee-band').innerHTML = `<div class="marquee-track">${items}</div>`;
}

/* ═══════════════════════════════════════════
   EDUCATION
═══════════════════════════════════════════ */
function buildEducation(education) {
  const section = makeSection('education', 'section-surface');
  section.innerHTML = sectionHeader('02', 'Education', 'Where I', 'Learned',
    'Two world-class institutions across two continents shaped my engineering foundations.');

  const grid = el('div', 'edu-grid');
  education.forEach((edu, i) => {
    const card = el('div', 'edu-card reveal');
    card.style.transitionDelay = `${i * 0.12}s`;
    card.innerHTML = `
      <div class="edu-label">${edu.degree}</div>
      <div class="edu-degree">${edu.school}</div>
      <div class="edu-period">${edu.period} · ${edu.location}</div>
      <div class="edu-gpa">GPA: ${edu.gpa}</div>
      <div class="course-tags">
        ${edu.courses.map(c => `<span class="course-tag">${c}</span>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });

  section.appendChild(grid);
  $('main-content').appendChild(section);
}

/* ═══════════════════════════════════════════
   EXPERIENCE  (grouped by company)
═══════════════════════════════════════════ */
function buildExperience(experience) {
  const section = makeSection('experience');
  section.innerHTML = sectionHeader('03', 'Experience', 'Where I', 'Worked',
    'From Silicon Valley to global startups — across three countries and five companies.');

  const groups = groupExperienceByCompany(experience);
  const list = el('div', 'exp-list');

  groups.forEach((group, gi) => {
    if (group.roles.length === 1) {
      // Single role — standard card
      const exp = group.roles[0];
      const item = el('div', 'exp-item reveal');
      item.style.transitionDelay = `${gi * 0.1}s`;
      item.innerHTML = buildExpItemHTML(exp);
      list.appendChild(item);
    } else {
      // Multiple roles at same company — grouped card
      const wrapper = el('div', 'exp-group reveal');
      wrapper.style.transitionDelay = `${gi * 0.1}s`;

      const header = el('div', 'exp-group-header');
      header.innerHTML = `
        <div class="exp-icon">${group.emoji}</div>
        <div class="exp-meta">
          <div class="exp-company">${group.company}</div>
          <div class="exp-role" style="color:var(--accent3)">${group.roles.length} roles</div>
        </div>
      `;
      wrapper.appendChild(header);

      group.roles.forEach((exp, ri) => {
        const roleBlock = el('div', 'exp-role-block');
        roleBlock.innerHTML = `
          <div class="exp-role-header">
            <div class="exp-role-title">${exp.role}</div>
            <div class="exp-period">${exp.period}</div>
          </div>
          <div class="exp-body">
            ${exp.points.map(p => `<p class="exp-point">${p}</p>`).join('')}
            <div class="tech-pills">
              ${exp.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
            </div>
          </div>
        `;
        wrapper.appendChild(roleBlock);
      });

      list.appendChild(wrapper);
    }
  });

  section.appendChild(list);
  $('main-content').appendChild(section);
}

function buildExpItemHTML(exp) {
  return `
    <div class="exp-header">
      <div class="exp-icon">${exp.emoji}</div>
      <div class="exp-meta">
        <div class="exp-company">${exp.company}</div>
        <div class="exp-role">${exp.role} · ${exp.location}</div>
      </div>
      <div class="exp-period">${exp.period}</div>
    </div>
    <div class="exp-body">
      ${exp.points.map(p => `<p class="exp-point">${p}</p>`).join('')}
      <div class="tech-pills">
        ${exp.tech.map(t => `<span class="tech-pill">${t}</span>`).join('')}
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════
   SKILLS GRID
═══════════════════════════════════════════ */
function buildSkillsGrid(skills_detail) {
  const section = makeSection('skills', 'section-surface');
  section.innerHTML = sectionHeader('04', 'Skills', 'What I', 'Know',
    'A full-stack toolkit from ML infrastructure to frontend.');

  const grid = el('div', 'skills-grid');
  Object.entries(skills_detail).forEach(([category, items], i) => {
    const card = el('div', 'skill-category reveal');
    card.style.transitionDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="skill-cat-label">${category}</div>
      <div class="skill-tags">
        ${items.map(s => `<span class="skill-tag">${s}</span>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });

  section.appendChild(grid);
  $('main-content').appendChild(section);
}

/* ═══════════════════════════════════════════
   PATENTS
═══════════════════════════════════════════ */
function buildPatents(patents, scholarUrl) {
  const section = makeSection('patents');
  section.innerHTML = sectionHeader('05', 'Patents & Research', 'Published', 'Patents',
    'US patent filings from work at Salesforce on secure, fine-grained data access in multi-tenant ML systems.');

  // Scholar link banner
  const scholarBanner = el('a', 'scholar-banner reveal');
  scholarBanner.href = scholarUrl;
  scholarBanner.target = '_blank';
  scholarBanner.rel = 'noopener';
  scholarBanner.innerHTML = `
    <div class="scholar-banner-left">
      <div class="scholar-icon">GS</div>
      <div>
        <div class="scholar-banner-title">Google Scholar Profile</div>
        <div class="scholar-banner-sub">View all publications and citations</div>
      </div>
    </div>
    <div class="scholar-arrow">↗</div>
  `;
  section.appendChild(scholarBanner);

  // Patent family note
  const familyNote = el('p', 'patent-family-note');
  familyNote.innerHTML = `
    <span class="patent-family-badge">Patent Family</span>
    These four filings form a single patent family covering different claim scopes of the same invention.
  `;
  section.appendChild(familyNote);

  // Patent cards
  const list = el('div', 'patent-list');
  patents.forEach((patent, i) => {
    const card = el('a', 'patent-card reveal');
    card.href = patent.url;
    card.target = '_blank';
    card.rel = 'noopener';
    card.style.transitionDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="patent-left">
        <div class="patent-icon">⚙</div>
        <div class="patent-meta">
          <div class="patent-title">${patent.title}</div>
          <div class="patent-number">${patent.number}</div>
        </div>
      </div>
      <div class="patent-right">
        <div class="patent-year">${patent.year}</div>
        <div class="patent-link-arrow">↗</div>
      </div>
    `;
    list.appendChild(card);
  });

  section.appendChild(list);
  $('main-content').appendChild(section);
}

/* ═══════════════════════════════════════════
   PROJECTS
═══════════════════════════════════════════ */
function buildProjects(projects) {
  const section = makeSection('projects', 'section-surface');
  section.innerHTML = sectionHeader('06', 'Projects', 'What I', 'Built',
    'Academic projects spanning AI, full-stack web, and mobile — from minimax agents to ML-powered apps.');

  const grid = el('div', 'proj-grid');
  projects.forEach((proj, i) => {
    const card = el('div', 'proj-card reveal');
    card.style.transitionDelay = `${i * 0.08}s`;

    const imgHTML = proj.image
      ? `<img class="proj-img" src="${proj.image}" alt="${proj.title}"
              onerror="this.outerHTML=\`${projectPlaceholder(proj.title).replace(/`/g, '\\`')}\`"/>`
      : projectPlaceholder(proj.title);

    card.innerHTML = `
      ${imgHTML}
      <div class="proj-num">0${i + 1}</div>
      <div class="proj-body">
        <div class="proj-title">${proj.title}</div>
        <div class="proj-subtitle">${proj.subtitle}</div>
        <p class="proj-desc">${proj.description}</p>
        <div class="proj-tech">
          ${proj.tech.map(t => `<span class="proj-tag">${t}</span>`).join('')}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  section.appendChild(grid);
  $('main-content').appendChild(section);
}

/* ═══════════════════════════════════════════
   ACHIEVEMENTS
═══════════════════════════════════════════ */
function buildAchievements(achievements) {
  const section = makeSection('achievements', 'section-surface');
  section.innerHTML = sectionHeader('07', 'Achievements', "Beyond the Desk:", 'Global Learning');

  const grid = el('div', 'ach-grid');
  achievements.forEach((ach, i) => {
    const card = el('div', 'ach-card reveal');
    card.style.transitionDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="ach-icon">${ach.emoji}</div>
      <div class="ach-text">${ach.text}</div>
    `;
    grid.appendChild(card);
  });

  section.appendChild(grid);
  $('main-content').appendChild(section);
}

/* ═══════════════════════════════════════════
   CONTACT
═══════════════════════════════════════════ */
function buildContact({ email, resume }) {
  const section = makeSection('contact', 'section');
  section.innerHTML = `
    <div class="section-eyebrow" style="justify-content:center">
      <span class="section-eyebrow-text">08 / Contact</span>
    </div>
    <h2 class="contact-heading">Let's <em>Talk.</em></h2>
    <p class="contact-sub">Always happy to connect with fellow engineers, researchers, or collaborators. ☕</p>
    <a class="contact-email" href="mailto:${email}">${email}</a>
    <div class="contact-actions">
      <a class="btn btn-primary" href="mailto:${email}">Send Me an Email</a>
      <a class="btn btn-ghost" href="${resume}" target="_blank" rel="noopener">Download Resume ↗</a>
    </div>
  `;
  $('main-content').appendChild(section);
}

/* ═══════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════ */
function buildFooter({ name }) {
  document.querySelector('footer').innerHTML =
    `<p>Built with ♥ · <span>${name}</span> · #FightOn 🏈</p>`;
}

/* ═══════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════ */
function initCursor() {
  const cursor = $('cursor');
  if (!cursor) return;
  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  (function animate() {
    curX += (mouseX - curX) * 0.18;
    curY += (mouseY - curY) * 0.18;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    requestAnimationFrame(animate);
  })();

  const interactive = 'a, button, .btn, .edu-card, .proj-card, .ach-card, .skill-category';
  document.addEventListener('mouseover', e => { if (e.target.closest(interactive)) cursor.classList.add('cursor-big'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest(interactive)) cursor.classList.remove('cursor-big'); });
}

/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
function initScrollReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.07 });

  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  });
}

/* ═══════════════════════════════════════════
   ACTIVE NAV
═══════════════════════════════════════════ */
function initActiveNav() {
  const links = document.querySelectorAll('.nav-links a');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
      }
    });
  }, { threshold: 0.3 });

  requestAnimationFrame(() => {
    document.querySelectorAll('section[id]').forEach(s => io.observe(s));
  });
}
