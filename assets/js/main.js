/*
  Eason Blog - Clean JavaScript
  模块标注：
  01 Data          文章、歌单、配置数据
  02 Utilities     常用工具函数
  03 ThemePalette  主题、调色板、壁纸开关
  04 Background    星星与流星
  05 Navigation    顶部栏收起、下拉菜单、返回顶部
  06 Music         音乐播放器与歌单
  07 PostsGallery  文章筛选、分页、相册、弹窗
  08 Reserved      预留模块
  09 Init          初始化入口
*/


/*
  ===================== 修改入口说明 =====================
  - CONFIG.siteStartDate：网站运行时间开始日期。
  - CONFIG.typingTexts：首页打字机文案。
  - CONFIG.playlist：音乐播放器歌单；已接入 4 首上传音源，保留 15 首容量。
  - posts 数据：文章标题、日期、分类、标签、图片、内容链接。
  - initThemePalette：调色板、深浅色、背景开关。
  - initMusic：音乐播放器、歌单、循环模式。
  - initPostsGallery：文章渲染、分类筛选、分页、单独文章页。
  =======================================================
*/

const QR_ASSET_BASE_URLS = {
  github: 'https://easonzhan-max.github.io',
  custom: 'https://easonzhan.xyz'
};

/* 01 Data */
const CONFIG = {
  siteStartDate: '2026-06-04',
  postsPerPage: 10,
  typingTexts: [
    '慢慢来，所有热爱都会发光。',
    '把普通日子过成自己的星河。',
    '今天也要向喜欢的未来靠近一点。',
    '奔赴星辰大海，不负心中热爱。'
  ],
  playlistCapacity: 15,
  defaultCover: "https://user14491.cn.imgto.link/public/20260619/50674c2c-6018-44b8-94d8-22f28f5fdd0a.avif",
  playlist: [
    { name: "青鸟衔梦", artist: "Akie秋会", cover: "assets/music/covers/qingniao-xianmeng-akie.jpeg", src: "assets/music/qingniao-xianmeng-akie.mp3", sources: ["assets/music/qingniao-xianmeng-akie.mp3"] },
    { name: "一点", artist: "Muyoi、徐梦洁", cover: "assets/music/covers/yidian-muyoi-xumengjie.jpeg", src: "assets/music/yidian-muyoi-xumengjie.mp3", sources: ["assets/music/yidian-muyoi-xumengjie.mp3"] },
    { name: "芭蕉夜雨", artist: "ChiliChill乐团", cover: "assets/music/covers/bajiao-yeyu-chilichill.jpeg", src: "assets/music/bajiao-yeyu-chilichill.mp3", sources: ["assets/music/bajiao-yeyu-chilichill.mp3"] },
    { name: "别回头 向前走", artist: "Ciyo", cover: "assets/music/covers/biehuitou-xiangqianzou-ciyo.jpeg", src: "assets/music/biehuitou-xiangqianzou-ciyo.mp3", sources: ["assets/music/biehuitou-xiangqianzou-ciyo.mp3"] },
    { name: "待添加歌曲 05", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] },
    { name: "待添加歌曲 06", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] },
    { name: "待添加歌曲 07", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] },
    { name: "待添加歌曲 08", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] },
    { name: "待添加歌曲 09", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] },
    { name: "待添加歌曲 10", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] },
    { name: "待添加歌曲 11", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] },
    { name: "待添加歌曲 12", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] },
    { name: "待添加歌曲 13", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] },
    { name: "待添加歌曲 14", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] },
    { name: "待添加歌曲 15", artist: "音源待添加", cover: CONFIG.defaultCover, src: '', sources: [] }
  ]
};

/* 02 Utilities */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const root = document.documentElement;
const safeText = (value) => String(value || '').replace(/[<>&]/g, (m) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m]));
const toPlayableMediaUrl = (url) => {
  // 按要求保留原始 HTTP 媒体链接，不自动改成 HTTPS。
  return String(url || '');
};
const fmtTime = (sec) => {
  if (!Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const fmtRunTime = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}天 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
const calcPostWordCount = (...parts) => {
  const text = parts.filter(Boolean).join(' ').replace(/https?:\/\/\S+/g, '链接');
  const chineseCount = (text.match(/[㐀-鿿]/g) || []).length;
  const latinCount = (text.replace(/[㐀-鿿]/g, ' ').match(/[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*/g) || []).length;
  return Math.max(0, chineseCount + latinCount);
};
const getPostViewCount = (slug, increase = true) => {
  const key = `eason-post-view-${slug}`;
  const current = Math.max(0, Number(localStorage.getItem(key) || 0));
  const next = increase ? current + 1 : current;
  localStorage.setItem(key, String(next));
  return next;
};
const buildPostKicker = (post, slug, title, body, link, increaseViews = true) => {
  const tagText = (post?.dataset?.tags || '').split(',').filter(Boolean).map((tag) => `#${tag}`).join(' ');
  const wordCount = calcPostWordCount(body);
  const views = getPostViewCount(slug, increaseViews);
  return `<div class="single-post-kicker"><span>帖子字数 ${wordCount} 字</span><span>浏览量 ${views}</span></div>`;
};

const buildPostShareUrl = (slug) => `${location.origin}${location.pathname}?post=${encodeURIComponent(slug)}`;
const getPostQrImageSrc = (slug, url) => {
  const safeSlug = String(slug || 'post').replace(/[^a-z0-9一-龥_-]/gi, '-');
  const host = String(location.hostname || '').toLowerCase();
  if (host.includes('easonzhan.xyz')) return `assets/images/qrcodes/easonzhan-xyz/${safeSlug}.png`;
  if (host.includes('easonzhan-max.github.io')) return `assets/images/qrcodes/github/${safeSlug}.png`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(url)}`;
};
const buildPostExcerpt = (body, category, tags) => {
  const cleanBody = String(body || '').trim();
  if (cleanBody) return cleanBody.length > 34 ? `${cleanBody.slice(0, 34)}…` : cleanBody;
  const tagText = String(tags || '').split(',').filter(Boolean).map((tag) => `#${tag}`).join(' ');
  return `来自 Eason 的小站 · ${category || '文章'}${tagText ? ` · ${tagText}` : ''}`;
};
const ensurePostShareModal = () => {
  let modal = $('#postShareModal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.className = 'modal post-share-modal';
  modal.id = 'postShareModal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="share-sheet" role="dialog" aria-modal="true" aria-label="分享文章">
      <button class="modal-close share-close" type="button" aria-label="关闭">×</button>
      <div class="share-poster" id="sharePosterPreview"></div>
      <div class="share-sheet-actions">
        <button class="share-action-btn" type="button" id="shareCopyBtn">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"></path><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"></path></svg>
          <span>复制链接</span>
        </button>
        <button class="share-action-btn primary" type="button" id="shareSaveBtn">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"></path><path d="M7 10l5 5 5-5"></path><path d="M5 21h14"></path></svg>
          <span>保存海报</span>
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const close = () => closeModal(modal);
  $('.share-close', modal)?.addEventListener('click', close);
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  return modal;
};
const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};
const wrapCanvasText = (ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) => {
  const chars = Array.from(String(text || ''));
  let line = '';
  let lines = [];
  for (const char of chars) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = char;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  lines = lines.slice(0, maxLines);
  lines.forEach((item, index) => ctx.fillText(index === maxLines - 1 && chars.join('').length > lines.join('').length ? `${item.slice(0, -1)}…` : item, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
};
const loadCanvasImage = (src) => new Promise((resolve) => {
  if (!src) return resolve(null);
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  if (/^https?:/i.test(String(src))) img.crossOrigin = 'anonymous';
  img.src = src;
});
const downloadSharePoster = async (data) => {
  const canvas = document.createElement('canvas');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = 900;
  const h = 1120;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, w, h);
  drawRoundedRect(ctx, 28, 28, w - 56, h - 56, 36);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.save();
  drawRoundedRect(ctx, 54, 54, w - 108, 392, 18);
  ctx.clip();
  const grad = ctx.createLinearGradient(54, 54, w - 54, 446);
  grad.addColorStop(0, '#ffe0de');
  grad.addColorStop(1, '#fff4f1');
  ctx.fillStyle = grad;
  ctx.fillRect(54, 54, w - 108, 392);
  const hero = await loadCanvasImage(data.img);
  if (hero) {
    const coverW = w - 108;
    const coverH = 392;
    const ratio = Math.max(coverW / hero.width, coverH / hero.height);
    const sw = hero.width * ratio;
    const sh = hero.height * ratio;
    ctx.globalAlpha = .22;
    ctx.drawImage(hero, 54 + (coverW - sw) / 2, 54 + (coverH - sh) / 2, sw, sh);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ctx.beginPath();
  ctx.arc(780, 82, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const day = String(data.date || '').split('-')[2] || '00';
  const ym = String(data.date || '').slice(0, 7).replace('-', ' ');
  drawRoundedRect(ctx, 94, 324, 112, 110, 10);
  ctx.fillStyle = 'rgba(90,84,84,.42)';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '700 56px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(day, 119, 384);
  ctx.fillRect(116, 398, 62, 4);
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(ym, 113, 424);

  ctx.fillStyle = '#111827';
  ctx.font = '800 44px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  const nextY = wrapCanvasText(ctx, data.title, 94, 542, 710, 56, 2);
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(94, nextY + 10, 6, 60);
  ctx.fillStyle = '#6b7280';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  wrapCanvasText(ctx, data.excerpt, 124, nextY + 48, 620, 34, 2);

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(94, 760);
  ctx.lineTo(806, 760);
  ctx.stroke();

  const avatar = await loadCanvasImage('https://user14491.cn.imgto.link/public/20260619/50674c2c-6018-44b8-94d8-22f28f5fdd0a.avif');
  ctx.save();
  ctx.beginPath();
  ctx.arc(150, 870, 48, 0, Math.PI * 2);
  ctx.clip();
  if (avatar) ctx.drawImage(avatar, 102, 822, 96, 96);
  else { ctx.fillStyle = '#bfdbfe'; ctx.fillRect(102, 822, 96, 96); }
  ctx.restore();
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillText('作者', 236, 846);
  ctx.fillStyle = '#111827';
  ctx.font = '800 36px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillText('Eason', 236, 895);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillText('扫码阅读文章', 510, 846);
  ctx.fillStyle = '#111827';
  ctx.font = '800 34px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  ctx.fillText('Eason的小站', 510, 895);

  const qrX = 682;
  const qrY = 788;
  const qrSize = 132;
  ctx.fillStyle = '#fff';
  drawRoundedRect(ctx, qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 12);
  ctx.fill();
  const qrImg = await loadCanvasImage(data.qrSrc);
  if (qrImg) {
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } else {
    ctx.fillStyle = '#111827';
    ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
    ctx.fillText('扫码打开', qrX + 28, qrY + 66);
  }

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `Eason-${data.slug || 'post'}-share.png`;
  a.click();
};
function openPostShare(data) {
  const modal = ensurePostShareModal();
  const poster = $('#sharePosterPreview', modal);
  const day = String(data.date || '').split('-')[2] || '00';
  const ym = String(data.date || '').slice(0, 7).replace('-', ' ');
  const excerpt = buildPostExcerpt(data.body, data.category, data.tags);
  const payloadUrl = data.url || buildPostShareUrl(data.slug);
  const payload = { ...data, excerpt, url: payloadUrl, qrSrc: data.qrSrc || getPostQrImageSrc(data.slug, payloadUrl) };
  if (poster) {
    poster.innerHTML = `
      <div class="share-poster-top">
        <img src="${safeText(data.img || '')}" alt="${safeText(data.title || '文章封面')}" />
        <span class="share-poster-orb"></span>
        <div class="share-date-badge"><strong>${safeText(day)}</strong><span>${safeText(ym)}</span></div>
      </div>
      <div class="share-poster-body">
        <h2>${safeText(data.title || '图片分享')}</h2>
        <p>${safeText(excerpt)}</p>
        <div class="share-poster-line"></div>
        <div class="share-poster-footer">
          <img class="share-author-avatar" src="https://user14491.cn.imgto.link/public/20260619/50674c2c-6018-44b8-94d8-22f28f5fdd0a.avif" alt="Eason头像" />
          <div class="share-author"><span>作者</span><strong>Eason</strong></div>
          <div class="share-site"><span>扫码阅读文章</span><strong>Eason的小站</strong></div>
          <img class="share-real-qr" src="${safeText(payload.qrSrc)}" alt="文章二维码" />
        </div>
      </div>`;
  }
  $('#shareCopyBtn', modal)?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(payload.url);
      $('#shareCopyBtn span', modal).textContent = '已复制';
      setTimeout(() => { const span = $('#shareCopyBtn span', modal); if (span) span.textContent = '复制链接'; }, 1300);
    } catch (error) {
      const input = document.createElement('input');
      input.value = payload.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
  }, { once: true });
  $('#shareSaveBtn', modal)?.addEventListener('click', () => downloadSharePoster(payload), { once: true });
  openModal(modal);
}
window.easonOpenPostShare = openPostShare;

const openModal = (id) => {
  const modal = typeof id === 'string' ? $(id) : id;
  if (!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (modal.id === 'paletteModal') document.body.classList.add('palette-open');
};
const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  if (modal.id === 'paletteModal') document.body.classList.remove('palette-open');
  if (!$('.modal.show')) document.body.classList.remove('modal-open');
};

/* 03 ThemePalette */
function currentTheme() {
  return root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function updateThemeButton() {
  const text = $('#themeText');
  const icon = $('#themeIcon');
  const dark = currentTheme() === 'dark';
  if (text) text.textContent = dark ? '浅色' : '深色';
  if (icon) icon.innerHTML = dark
    ? '<path d="M12 4v1.5M12 18.5V20M4 12h1.5M18.5 12H20M6.3 6.3l1 1M16.7 16.7l1 1M17.7 6.3l-1 1M7.3 16.7l-1 1"></path><circle cx="12" cy="12" r="4"></circle>'
    : '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"></path>';
}

const customState = {
  hue: Number(localStorage.getItem('custom-hue') || 210),
  bgMode: localStorage.getItem('custom-bg-mode') || 'default',
  showHeroText: localStorage.getItem('custom-show-hero-text') !== '0',
  showStars: true,
  showMeteor: localStorage.getItem('custom-show-meteor') !== '0',
  showMist: localStorage.getItem('custom-show-mist') !== '0',
  showDividerFx: localStorage.getItem('custom-show-divider-fx') !== '0'
};

function applyAccentHue(hueValue) {
  const hue = ((Number(hueValue) % 360) + 360) % 360;
  const dark = currentTheme() === 'dark';
  root.style.setProperty('--mist', dark ? `hsl(${hue} 42% 66%)` : `hsl(${hue} 42% 74%)`);
  root.style.setProperty('--mist-2', dark ? `hsl(${(hue + 14) % 360} 25% 38%)` : `hsl(${(hue + 12) % 360} 42% 84%)`);
  root.style.setProperty('--mist-3', dark ? `hsl(${(hue + 8) % 360} 32% 12%)` : `hsl(${(hue + 8) % 360} 48% 96%)`);
  root.style.setProperty('--pink', dark ? `hsl(${(hue + 34) % 360} 46% 72%)` : `hsl(${(hue + 34) % 360} 52% 78%)`);
  root.style.setProperty('--line', dark ? `hsla(${hue} 28% 82% / .14)` : `hsla(${hue} 24% 46% / .22)`);
  $('#hueValue') && ($('#hueValue').textContent = hue);
  $('#hueSlider') && ($('#hueSlider').value = hue);
  customState.hue = hue;
  localStorage.setItem('custom-hue', String(hue));
}

function applyBackgroundMode(mode) {
  const safeMode = ['default', 'night'].includes(mode) ? mode : 'default';
  root.classList.remove('bg-gradient', 'bg-night', 'bg-solid');
  if (safeMode !== 'default') root.classList.add(`bg-${safeMode}`);
  customState.bgMode = safeMode;
  localStorage.setItem('custom-bg-mode', safeMode);
  $$('[data-bg-mode]').forEach((btn) => btn.classList.toggle('active', btn.dataset.bgMode === safeMode));
}

function applyWallpaperSwitches() {
  root.classList.toggle('custom-hide-hero-text', !customState.showHeroText);
  customState.showStars = true;
  root.classList.remove('custom-hide-stars');
  root.classList.toggle('custom-hide-meteor', !customState.showMeteor);
  root.classList.toggle('custom-hide-mist', !customState.showMist);
  root.classList.toggle('custom-hide-divider-fx', !customState.showDividerFx);
  const pairs = [
    ['toggleHeroText', 'showHeroText'], ['toggleStars', 'showStars'],
    ['toggleMeteor', 'showMeteor'], ['toggleMist', 'showMist'], ['toggleDividerFx', 'showDividerFx']
  ];
  pairs.forEach(([id, key]) => {
    const input = $(`#${id}`);
    if (input) input.checked = customState[key];
    localStorage.setItem(`custom-${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}`, customState[key] ? '1' : '0');
  });
}

function initThemePalette() {
  if (localStorage.getItem('theme')) root.dataset.theme = localStorage.getItem('theme');
  updateThemeButton();
  applyAccentHue(customState.hue);
  applyBackgroundMode(customState.bgMode);
  applyWallpaperSwitches();

  $('#themeBtn')?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
    updateThemeButton();
    applyAccentHue(customState.hue);
  });

  $('#paletteBtn')?.addEventListener('click', () => openModal('#paletteModal'));
  $('#hueSlider')?.addEventListener('input', (event) => applyAccentHue(event.target.value));
  $$('[data-bg-mode]').forEach((btn) => btn.addEventListener('click', () => applyBackgroundMode(btn.dataset.bgMode)));
  $('#paletteResetBtn')?.addEventListener('click', () => {
    localStorage.removeItem('custom-hue');
    localStorage.removeItem('custom-bg-mode');
    ['custom-show-hero-text', 'custom-show-stars', 'custom-show-meteor', 'custom-show-mist', 'custom-show-divider-fx'].forEach((key) => localStorage.removeItem(key));
    Object.assign(customState, { hue: 210, bgMode: 'default', showHeroText: true, showStars: true, showMeteor: true, showMist: true, showDividerFx: true });
    applyAccentHue(210);
    applyBackgroundMode('default');
    applyWallpaperSwitches();
  });
  [
    ['toggleHeroText', 'showHeroText'], ['toggleStars', 'showStars'],
    ['toggleMeteor', 'showMeteor'], ['toggleMist', 'showMist'], ['toggleDividerFx', 'showDividerFx']
  ].forEach(([id, key]) => $(`#${id}`)?.addEventListener('change', (e) => {
    customState[key] = e.target.checked;
    applyWallpaperSwitches();
  }));
}

/* 04 Background */
function initTyping() {
  const target = $('#typeText');
  let typeIndex = 0;
  let charIndex = 0;
  let deleting = false;
  const loop = () => {
    const text = CONFIG.typingTexts[typeIndex];
    target.textContent = text.slice(0, charIndex);
    if (!deleting && charIndex < text.length) { charIndex += 1; setTimeout(loop, 90); return; }
    if (!deleting) { deleting = true; setTimeout(loop, 1600); return; }
    if (charIndex > 0) { charIndex -= 1; setTimeout(loop, 45); return; }
    deleting = false;
    typeIndex = (typeIndex + 1) % CONFIG.typingTexts.length;
    setTimeout(loop, 300);
  };
  if (target) loop();
}

function initStars() {
  const canvas = $('#starsCanvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  let stars = [];
  let size = { w: 0, h: 0, dpr: 1 };
  let rafId = 0;

  const createStar = (w, h) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    baseX: Math.random() * w,
    r: Math.random() * 1.65 + .45,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * .024 + .010,
    drift: Math.random() * .22 + .04,
    fall: Math.random() * .09 + .025
  });

  const resize = (force = false) => {
    const w = Math.max(window.innerWidth, document.documentElement.clientWidth || 0);
    const h = Math.max(window.innerHeight, document.documentElement.clientHeight || 0);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!force && size.w && Math.abs(w - size.w) < 2 && Math.abs(h - size.h) < 80 && Math.abs(dpr - size.dpr) < .01) return;

    const oldSize = { ...size };
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.min(260, Math.max(90, Math.floor((w * h) / 6200)));
    stars = stars.length ? stars.slice(0, target).map((star) => {
      const next = { ...star };
      next.x = (star.x / (oldSize.w || w)) * w;
      next.y = (star.y / (oldSize.h || h)) * h;
      next.baseX = (star.baseX / (oldSize.w || w)) * w;
      return next;
    }) : [];
    while (stars.length < target) stars.push(createStar(w, h));
    size = { w, h, dpr };
  };

  const draw = () => {
    ctx.clearRect(0, 0, size.w, size.h);
    const rgb = getComputedStyle(root).getPropertyValue('--star-rgb').trim() || '159,185,201';
    for (const star of stars) {
      star.phase += star.speed;
      const twinkle = .36 + Math.abs(Math.sin(star.phase)) * .64;
      const glow = Math.min(1, twinkle + .18);
      star.x = star.baseX + Math.sin(star.phase * .72) * star.drift * 8;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, ${twinkle})`;
      ctx.shadowColor = `rgba(${rgb}, ${glow})`;
      ctx.shadowBlur = star.r * 5.2;
      ctx.fill();
      ctx.shadowBlur = 0;

      star.y += star.fall;
      if (star.y > size.h + 8) {
        star.y = -8;
        star.baseX = Math.random() * size.w;
        star.x = star.baseX;
      }
    }
    rafId = requestAnimationFrame(draw);
  };

  let timer;
  window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(() => resize(), 120); }, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(() => resize(true), 180));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else { resize(true); draw(); }
  });
  resize(true);
  draw();
}

function initMeteors() {
  const layer = $('#meteorLayer');
  if (!layer) return;
  const launch = () => {
    if (root.classList.contains('custom-hide-meteor')) return;
    const meteor = document.createElement('span');
    meteor.className = 'meteor';
    meteor.style.left = `${55 + Math.random() * 50}vw`;
    meteor.style.top = `${5 + Math.random() * 50}vh`;
    meteor.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
    layer.appendChild(meteor);
    requestAnimationFrame(() => meteor.classList.add('fly'));
    setTimeout(() => meteor.remove(), 3600);
  };
  setInterval(launch, 4200);
  setTimeout(launch, 800);
}

/* 05 Navigation */
function initNavigation() {
  const nav = $('#siteNav');
  const backTop = $('#backTopBtn');
  const mobileNavToggle = $('#mobileNavToggle');
  const mobileQuery = window.matchMedia('(max-width: 900px)');
  const getScrollTop = () => Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);
  const sync = () => {
    const top = getScrollTop();
    nav?.classList.toggle('nav-collapsed-top', top <= 48);
    backTop?.classList.toggle('is-hidden', top < 220);
  };
  const setMobileNavCollapsed = (collapsed) => {
    if (!nav || !mobileNavToggle) return;
    const active = mobileQuery.matches && collapsed;
    nav.classList.toggle('mobile-links-collapsed', active);
    mobileNavToggle.setAttribute('aria-expanded', String(!active));
    mobileNavToggle.setAttribute('aria-label', active ? '展开顶部栏' : '收起顶部栏');
    mobileNavToggle.setAttribute('title', active ? '展开顶部栏' : '收起顶部栏');
  };
  const syncMobileNav = () => {
    if (!mobileQuery.matches) {
      setMobileNavCollapsed(false);
      return;
    }
    const saved = localStorage.getItem('eason-mobile-nav-collapsed') !== '0';
    setMobileNavCollapsed(saved);
  };
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync, { passive: true });
  window.addEventListener('load', sync);
  backTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    [80, 220, 460, 760].forEach((delay) => setTimeout(sync, delay));
  });
  $$('[data-scroll-target]').forEach((btn) => btn.addEventListener('click', () => $(btn.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth' })));
  const closeNavDropdown = (drop) => {
    drop.classList.remove('open');
    $('.nav-drop-btn', drop)?.setAttribute('aria-expanded', 'false');
  };
  $$('.nav-dropdown').forEach((drop) => {
    const btn = $('.nav-drop-btn', drop);
    const menu = $('.nav-dropdown-menu', drop);
    btn?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const shouldOpen = !drop.classList.contains('open');
      $$('.nav-dropdown.open').forEach((other) => closeNavDropdown(other));
      if (shouldOpen) {
        drop.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    menu?.addEventListener('click', () => closeNavDropdown(drop));
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-dropdown')) $$('.nav-dropdown.open').forEach((drop) => closeNavDropdown(drop));
  });

  mobileNavToggle?.addEventListener('click', () => {
    const collapsed = !nav?.classList.contains('mobile-links-collapsed');
    setMobileNavCollapsed(collapsed);
    localStorage.setItem('eason-mobile-nav-collapsed', collapsed ? '1' : '0');
    $$('.nav-dropdown.open').forEach((drop) => closeNavDropdown(drop));
  });
  window.addEventListener('resize', syncMobileNav, { passive: true });
  syncMobileNav();

  // 关于我已改为独立站长页，侧栏头像不再绑定站内关于区。
  sync();
}

/* 06 Music */
function initMusic() {
  const audio = $('#audio');
  if (!audio) return;
  const MUSIC_STATE_KEY = 'eason-music-state-v1';
  const readMusicState = () => {
    try { return JSON.parse(localStorage.getItem(MUSIC_STATE_KEY) || '{}') || {}; }
    catch { return {}; }
  };
  const savedMusicState = readMusicState();
  let songIndex = Number.isFinite(Number(savedMusicState.index)) ? Number(savedMusicState.index) : 0;
  songIndex = CONFIG.playlist.length ? (songIndex + CONFIG.playlist.length) % CONFIG.playlist.length : 0;
  let playMode = savedMusicState.mode || localStorage.getItem('eason-play-mode') || 'loop';
  if (!['loop', 'single'].includes(playMode)) playMode = 'loop';
  const playIcon = '<svg id="playIcon" viewBox="0 0 24 24"><path d="M8 6l10 6-10 6V6z"></path></svg>';
  const pauseIcon = '<svg id="playIcon" viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"></path></svg>';
  const modeNames = { loop: '列表循环', single: '单曲循环' };
  const topIcons = {
    listMode: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h11"></path><path d="M16 6l3 3-3 3"></path><path d="M5 18h14"></path></svg>',
    loopMode: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 2l4 4-4 4"></path><path d="M3 11V9a3 3 0 0 1 3-3h15"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v2a3 3 0 0 1-3 3H3"></path></svg>',
    singleMode: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 2l4 4-4 4"></path><path d="M3 11V9a3 3 0 0 1 3-3h15"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v2a3 3 0 0 1-3 3H3"></path><path d="M12 9v6"></path><path d="M10.5 10.5L12 9l1.5 1.5"></path></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 19L3 12l8-7"></path><path d="M20 19l-8-7 8-7"></path></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill-icon"><path d="M8 5.5v13l11-6.5-11-6.5z"></path></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill-icon"><rect x="7" y="5" width="4" height="14" rx="1.4"></rect><rect x="13" y="5" width="4" height="14" rx="1.4"></rect></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 5l8 7-8 7"></path><path d="M4 5l8 7-8 7"></path></svg>',
    list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3.5 6h.01"></path><path d="M3.5 12h.01"></path><path d="M3.5 18h.01"></path></svg>'
  };
  const modeIcon = () => playMode === 'single' ? topIcons.singleMode : topIcons.loopMode;
  const setIconButton = (selector, icon, label) => {
    const btn = $(selector);
    if (!btn) return;
    btn.innerHTML = `${icon}<span class="btn-label">${label}</span>`;
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  };
  const setTopButton = setIconButton;

  const saveMusicState = (playing = !audio.paused) => {
    try {
      localStorage.setItem(MUSIC_STATE_KEY, JSON.stringify({
        index: songIndex,
        time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
        playing: !!playing,
        mode: playMode,
        updated: Date.now()
      }));
    } catch {}
  };
  const current = () => CONFIG.playlist[songIndex] || { name: '暂无歌曲', artist: '等待添加', cover: CONFIG.defaultCover || '', src: '', sources: [] };
  let audioSourceIndex = 0;
  let wantPlaying = false;
  const getSources = (track) => Array.from(new Set([...(track.sources || []), track.src].filter(Boolean)));
  const setAudioSource = (track, index = 0) => {
    const sources = getSources(track);
    audioSourceIndex = Math.max(0, Math.min(index, Math.max(0, sources.length - 1)));
    
    const src = toPlayableMediaUrl(sources[audioSourceIndex] || track.src || '');
    if (src) audio.src = src; else audio.removeAttribute('src');
  };
  const setText = (selector, text) => { const el = $(selector); if (el) el.textContent = text; };
  const setImage = (selector, src) => { const el = $(selector); if (el) el.src = src; };
  const renderMenus = () => {
    const html = CONFIG.playlist.length ? CONFIG.playlist.map((track, index) => `
      <button class="playlist-item ${index === songIndex ? 'active' : ''}" type="button" data-song-index="${index}">
        <img src="${safeText(track.cover || CONFIG.defaultCover || '')}" alt="${safeText(track.name)}封面" />
        <span class="playlist-item-text"><strong>${safeText(track.name)}</strong><small>${safeText(track.artist)}</small></span>
      </button>`).join('') : '<div class="playlist-empty">暂无歌曲</div>';
    ['#playlistMenu', '#modalPlaylistMenu', '#topMusicPlaylist'].forEach((selector) => { const el = $(selector); if (el) el.innerHTML = html; });
  };
  const syncMode = () => {
    audio.loop = playMode === 'single';
    setIconButton('#loopModeBtn', modeIcon(), modeNames[playMode]);
    setText('#modalLoopModeBtn', modeNames[playMode]);
    setTopButton('#topMusicMode', modeIcon(), modeNames[playMode]);
    ['#topMusicMode', '#loopModeBtn'].forEach((selector) => { const modeBtn = $(selector); if (modeBtn) modeBtn.dataset.mode = playMode; });
    localStorage.setItem('eason-play-mode', playMode);
    saveMusicState();
  };
  const updateUI = () => {
    const track = current();
    const isPlaying = !audio.paused;
    if (!audio.src) setAudioSource(track, 0);
    const hasSource = getSources(track).length > 0;
    const statusText = !hasSource ? '等待音源' : (isPlaying ? '正在播放' : '已暂停');
    setText('#songName', track.name); setText('#songStatus', statusText); setText('#songArtist', track.artist);
    setText('#musicModalTitle', track.name); setText('#musicModalStatus', statusText); setText('#musicModalArtist', track.artist);
    setText('#topMusicTitle', track.name); setText('#topMusicSub', track.artist);
    setText('#playlistTriggerName', track.name); setText('#playlistTriggerAlbum', track.artist);
    setText('#modalPlaylistName', track.name); setText('#modalPlaylistAlbum', track.artist);
    ['#albumCover img', '#musicModalCover', '#topMusicCover', '#playlistThumb', '#modalPlaylistThumb'].forEach((selector) => { const el = $(selector); if (el) { const cover = track.cover || CONFIG.defaultCover || ''; if (cover) el.src = cover; else el.removeAttribute('src'); } });
    ['#albumCover', '#musicModalCoverWrap'].forEach((selector) => $(selector)?.classList.toggle('playing', isPlaying));
    $('#playBtn') && ($('#playBtn').innerHTML = isPlaying ? pauseIcon : playIcon);
    setText('#modalPlayBtn', isPlaying ? '暂停' : '播放');
    setTopButton('#topMusicPlay', isPlaying ? topIcons.pause : topIcons.play, isPlaying ? '暂停' : '播放');
    $('#topMusicPlay')?.classList.toggle('is-playing', isPlaying);
    setTopButton('#topMusicPrev', topIcons.prev, '上一首');
    setTopButton('#topMusicNext', topIcons.next, '下一首');
    setTopButton('#topMusicList', topIcons.list, '歌单');
    setIconButton('#playlistIconBtn', topIcons.list, '歌单');
    renderMenus();
  };
  const loadSong = (index, autoplay = false) => {
    if (!CONFIG.playlist.length) { audio.pause(); audio.removeAttribute('src'); updateUI(); syncProgress(); saveMusicState(false); return; }
    songIndex = (index + CONFIG.playlist.length) % CONFIG.playlist.length;
    audio.loop = playMode === 'single';
    setAudioSource(current(), 0);
    audio.load();
    updateUI();
    wantPlaying = !!autoplay;
    saveMusicState(autoplay);
    if (autoplay && getSources(current()).length) audio.play().catch(() => { setText('#songStatus', '点击播放'); setText('#musicModalStatus', '点击播放'); });
    else if (autoplay) { setText('#songStatus', '等待音源'); setText('#musicModalStatus', '等待音源'); }
  };
  const playPause = () => {
    if (!CONFIG.playlist.length) { setText('#songStatus', '暂无歌曲'); setText('#musicModalStatus', '暂无歌曲'); return; }
    if (audio.paused) {
      if (!getSources(current()).length) { setText('#songStatus', '等待音源'); setText('#musicModalStatus', '等待音源'); return; }
      wantPlaying = true;
      audio.play().catch(() => { setText('#songStatus', '点击播放'); setText('#musicModalStatus', '点击播放'); });
    } else {
      wantPlaying = false;
      audio.pause();
    }
  };
  const nextSong = (manual = false) => {
    if (!CONFIG.playlist.length) return;
    const isManual = manual === true;
    if (playMode === 'single' && !isManual) {
      audio.currentTime = 0;
      wantPlaying = true; audio.play().catch(() => {});
      return;
    }
    const next = songIndex + 1;
    loadSong(next % CONFIG.playlist.length, true);
  };
  const prevSong = () => loadSong(songIndex - 1, true);
  const cycleMode = () => { playMode = playMode === 'loop' ? 'single' : 'loop'; syncMode(); };
  const syncProgress = () => {
    const duration = audio.duration || 0;
    const currentTime = audio.currentTime || 0;
    const percent = duration ? (currentTime / duration) * 100 : 0;
    ['#progress', '#musicModalProgress', '#topMusicProgress'].forEach((selector) => { const input = $(selector); if (input) input.value = percent; });
    ['#currentTime', '#musicModalCurrent'].forEach((selector) => setText(selector, fmtTime(currentTime)));
    ['#duration', '#musicModalDuration'].forEach((selector) => setText(selector, fmtTime(duration)));
    setText('#topMusicTime', `${fmtTime(currentTime)} / ${fmtTime(duration)}`);
  };
  const seek = (value) => { if (audio.duration) audio.currentTime = (Number(value) / 100) * audio.duration; };
  const topPopover = $('#topMusicPopover');
  const topPlaylistPanel = $('#topMusicPlaylist');
  const openTopMusic = () => {
    topPopover?.classList.add('show');
    topPopover?.setAttribute('aria-hidden', 'false');
  };
  const closeTopMusic = () => {
    topPopover?.classList.remove('show');
    topPopover?.setAttribute('aria-hidden', 'true');
    topPlaylistPanel?.classList.remove('show');
  };
  const toggleTopMusic = () => topPopover?.classList.contains('show') ? closeTopMusic() : openTopMusic();

  const bindMusicBtn = (selector, handler) => $(selector)?.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); handler(); });
  ['#playBtn', '#modalPlayBtn'].forEach((selector) => bindMusicBtn(selector, playPause));
  ['#nextBtn', '#modalNextBtn'].forEach((selector) => bindMusicBtn(selector, () => nextSong(true)));
  ['#prevBtn', '#modalPrevBtn'].forEach((selector) => bindMusicBtn(selector, prevSong));
  ['#loopModeBtn', '#modalLoopModeBtn'].forEach((selector) => bindMusicBtn(selector, cycleMode));
  const topControls = $('.top-music-controls');
  topControls?.addEventListener('click', (event) => {
    const btn = event.target.closest('button');
    if (!btn || !topControls.contains(btn)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (btn.id === 'topMusicPlay') playPause();
    if (btn.id === 'topMusicNext') nextSong(true);
    if (btn.id === 'topMusicPrev') prevSong();
    if (btn.id === 'topMusicMode') cycleMode();
    if (btn.id === 'topMusicList') topPlaylistPanel?.classList.toggle('show');
  }, true);
  ['#progress', '#musicModalProgress', '#topMusicProgress'].forEach((selector) => $(selector)?.addEventListener('input', (e) => seek(e.target.value)));
  ['#playlistTrigger', '#modalPlaylistTrigger', '#playlistIconBtn'].forEach((selector) => $(selector)?.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = e.currentTarget.closest('.playlist-dropdown') || $('#playlistDropdown');
    dropdown?.classList.toggle('open');
    $('#music')?.classList.toggle('music-panel-open', !!$('#playlistDropdown')?.classList.contains('open'));
  }));
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.playlist-dropdown')) {
      $$('.playlist-dropdown.open').forEach((el) => el.classList.remove('open'));
      $('#music')?.classList.remove('music-panel-open');
    }
  });
  document.addEventListener('click', (event) => {
    const item = event.target.closest('[data-song-index]');
    if (!item) return;
    loadSong(Number(item.dataset.songIndex), true);
  });
  $('#musicQuick')?.addEventListener('click', toggleTopMusic);
  $('#topMusicClose')?.addEventListener('click', closeTopMusic);
  $('#music')?.addEventListener('click', (event) => { if (!event.target.closest('button,input,.playlist-dropdown')) openModal('#musicModal'); });
  $('#musicPromptYes')?.addEventListener('click', () => { $('#musicPlayTip')?.classList.remove('show'); wantPlaying = true; audio.play().catch(() => { setText('#songStatus', '点击播放'); setText('#musicModalStatus', '点击播放'); }); openTopMusic(); });
  $('#musicPromptNo')?.addEventListener('click', () => { $('#musicPlayTip')?.classList.remove('show'); });
  audio.addEventListener('play', updateUI);
  audio.addEventListener('pause', updateUI);
  audio.addEventListener('timeupdate', syncProgress);
  audio.addEventListener('loadedmetadata', syncProgress);
  audio.addEventListener('error', () => {
    const sources = getSources(current());
    if (audioSourceIndex < sources.length - 1) {
      const keepPlaying = wantPlaying || !audio.paused;
      const keepTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      setAudioSource(current(), audioSourceIndex + 1);
      audio.load();
      if (keepTime > 0) audio.addEventListener('loadedmetadata', () => { try { audio.currentTime = Math.min(keepTime, Math.max(0, audio.duration - 1)); } catch {} }, { once: true });
      setText('#songStatus', '切换备用音源');
      setText('#musicModalStatus', '切换备用音源');
      if (keepPlaying) audio.play().catch(() => {});
      return;
    }
    setText('#songStatus', '音频加载失败');
    setText('#musicModalStatus', '音频加载失败');
    saveMusicState(false);
  });
  audio.addEventListener('ended', () => nextSong(false));
  closeTopMusic();
  syncMode();
  loadSong(songIndex, false);
  const savedTime = Number(savedMusicState.time || 0);
  if (savedTime > 0) {
    audio.addEventListener('loadedmetadata', () => {
      try { if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(savedTime, Math.max(0, audio.duration - 1)); } catch {}
    }, { once: true });
  }
  const shouldResume = savedMusicState.playing && Date.now() - Number(savedMusicState.updated || 0) < 20000;
  if (shouldResume) {
    window.addEventListener('load', () => setTimeout(() => audio.play().catch(() => {}), 180), { once: true });
  } else {
    window.addEventListener('load', () => { setTimeout(() => $('#musicPlayTip')?.classList.add('show'), 500); }, { once: true });
  }
  audio.addEventListener('play', () => saveMusicState(true));
  audio.addEventListener('pause', () => saveMusicState(false));
  audio.addEventListener('timeupdate', () => saveMusicState(!audio.paused));
  window.addEventListener('beforeunload', () => saveMusicState(!audio.paused));
}

/* 07 PostsGallery */
function initPostsGallery() {
  const allPosts = $$('.post').sort((a, b) => (b.dataset.date || '').localeCompare(a.dataset.date || ''));
  const postList = $('#postList');
  const pagination = $('#pagination');
  let detailPage = $('#postDetailPage');
  if (!detailPage && postList) {
    detailPage = document.createElement('section');
    detailPage.id = 'postDetailPage';
    detailPage.className = 'post-detail-page hidden';
    detailPage.setAttribute('aria-live', 'polite');
    postList.insertAdjacentElement('afterend', detailPage);
  }
  const contentArea = $('.content');
  let currentFilter = 'all';
  let currentPage = 1;
  let lastListScrollTop = 0;
  const getPageScrollTop = () => Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);

  const saveListScrollTop = () => {
    lastListScrollTop = getPageScrollTop();
    try { sessionStorage.setItem('eason-post-list-scroll', String(lastListScrollTop)); } catch (error) {}
  };
  const getSavedListScrollTop = () => {
    try {
      const raw = sessionStorage.getItem('eason-post-list-scroll');
      if (raw !== null && raw !== '') return Number(raw) || 0;
    } catch (error) {}
    return Number(lastListScrollTop) || 0;
  };
  const restoreListScrollTop = (smooth = true) => {
    const top = getSavedListScrollTop();
    requestAnimationFrame(() => {
      window.scrollTo({ top, left: 0, behavior: smooth ? 'smooth' : 'auto' });
    });
  };

  const slugify = (text) => String(text || '').toLowerCase().replace(/[^a-z0-9一-龥]+/g, '-').replace(/^-|-$/g, '') || 'post';
  const getPostSlug = (post, index = 0) => {
    if (!post.dataset.slug) {
      const imgName = ($('img', post)?.getAttribute('src') || '').split('/').pop()?.replace(/\.[^.]+$/, '') || `post-${index + 1}`;
      post.dataset.slug = `${post.dataset.date || 'post'}-${slugify(imgName)}`;
    }
    return post.dataset.slug;
  };

  allPosts.forEach((post, index) => {
    postList.appendChild(post);
    getPostSlug(post, index);
    post.setAttribute('role', 'link');
    post.setAttribute('tabindex', '0');
    post.setAttribute('aria-label', `打开文章：${post.dataset.title || $('h3', post)?.textContent || '图片分享'}`);
  });
  $('#articleTotalText') && ($('#articleTotalText').textContent = `共 ${allPosts.length} 篇文章`);
  $('#articleCount') && ($('#articleCount').textContent = String(allPosts.length));

  const getFiltered = () => {
    const keyword = ($('#searchInput')?.value || '').trim().toLowerCase();
    return allPosts.filter((post) => {
      const matchFilter = currentFilter === 'all' || post.dataset.category === currentFilter || (post.dataset.tags || '').includes(currentFilter);
      const text = `${post.dataset.title} ${post.dataset.category} ${post.dataset.tags} ${post.textContent}`.toLowerCase();
      return matchFilter && (!keyword || text.includes(keyword));
    });
  };
  const renderPagination = (count) => {
    const pages = Math.max(1, Math.ceil(count / CONFIG.postsPerPage));
    currentPage = Math.min(currentPage, pages);
    if (!pagination) return;
    pagination.innerHTML = '';
    const addBtn = (label, page, disabled = false, active = false) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = active ? 'page-number active' : (Number.isInteger(page) ? 'page-number' : 'page-btn');
      btn.textContent = label;
      btn.disabled = disabled;
      btn.addEventListener('click', () => { currentPage = page; renderPosts(); $('#posts')?.scrollIntoView({ behavior: 'smooth' }); });
      pagination.appendChild(btn);
    };
    addBtn('上一页', currentPage - 1, currentPage <= 1);
    for (let page = 1; page <= pages; page += 1) addBtn(String(page), page, false, page === currentPage);
    addBtn('下一页', currentPage + 1, currentPage >= pages);
  };
  function renderPosts() {
    const filtered = getFiltered();
    const start = (currentPage - 1) * CONFIG.postsPerPage;
    const end = start + CONFIG.postsPerPage;
    const visiblePosts = filtered.slice(start, end);
    allPosts.forEach((post) => post.classList.add('hidden'));
    filtered.forEach((post, index) => {
      post.classList.toggle('hidden', index < start || index >= end);
    });
    postList?.classList.remove('single-card');
    renderPagination(filtered.length);
    document.dispatchEvent(new CustomEvent('eason:posts-rendered', {
      detail: { visibleCount: visiblePosts.length, filteredCount: filtered.length, page: currentPage, filter: currentFilter }
    }));
  }
  const setFilter = (filter) => {
    showList(false);
    currentFilter = filter;
    currentPage = 1;
    $$('.tool-btn[data-filter]').forEach((btn) => btn.classList.toggle('active', btn.dataset.filter === filter));
    renderPosts();
  };

  $$('.tool-btn[data-filter]').forEach((btn) => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
  $('#searchInput')?.addEventListener('input', () => { showList(false); currentPage = 1; renderPosts(); });
  $('#randomPostBtn')?.addEventListener('click', () => {
    const list = getFiltered();
    const post = list[Math.floor(Math.random() * list.length)];
    if (post) openArticle(post);
  });

  function renderStats() {
    const categories = new Map();
    const tags = new Map();
    allPosts.forEach((post) => {
      categories.set(post.dataset.category, (categories.get(post.dataset.category) || 0) + 1);
      (post.dataset.tags || '').split(',').filter(Boolean).forEach((tag) => tags.set(tag, (tags.get(tag) || 0) + 1));
    });
    $('#categoryStats').innerHTML = [...categories].map(([name, count]) => `<button class="category-item" type="button" data-stat-filter="${safeText(name)}"><span>${safeText(name)}</span><span class="count-badge">${count}</span></button>`).join('');
    $('#tagStats').innerHTML = [...tags].map(([name, count]) => `<button class="tag-stat" type="button" data-stat-filter="${safeText(name)}">#${safeText(name)} <small>${count}</small></button>`).join('');
  }
  renderStats();
  document.addEventListener('click', (event) => {
    const stat = event.target.closest('[data-stat-filter]');
    if (stat) { setFilter(stat.dataset.statFilter); $('#posts')?.scrollIntoView({ behavior: 'smooth' }); }
  });

  function showList(push = true, restore = false) {
    contentArea?.classList.remove('detail-mode');
    detailPage?.classList.add('hidden');
    renderPosts();
    if (push && new URLSearchParams(location.search).has('post')) {
      history.pushState({ post: null, listScroll: getSavedListScrollTop() }, '', location.pathname + location.hash);
    }
    if (restore) restoreListScrollTop(true);
  }

  function openArticle(post, push = true) {
    if (!post || !detailPage) return;
    if (!contentArea?.classList.contains('detail-mode')) saveListScrollTop();
    const slug = getPostSlug(post, allPosts.indexOf(post));
    const img = $('img', post)?.src || '';
    const title = $('h3', post)?.textContent || post.dataset.title || '图片分享';
    const date = post.dataset.date || '';
    const category = post.dataset.category || '';
    const tagsHtml = $('.tags', post)?.innerHTML || '';
    const body = $('p', post)?.textContent.trim() || '';
    const link = post.dataset.link || '';
    const video = post.dataset.video || '';
    const videoPlayable = toPlayableMediaUrl(video);
    const videoHtml = video ? `<div class="single-video-wrap"><video class="single-post-video" controls playsinline preload="metadata" poster="${safeText(img)}"><source src="${safeText(videoPlayable)}" type="video/mp4" />你的浏览器不支持视频播放。</video><div class="single-video-fallback"><strong>电脑端播放不了？</strong><span>如果浏览器拦截 HTTP 视频源，可以直接打开原始链接。</span><a href="${safeText(video)}" target="_blank" rel="noopener noreferrer">打开视频链接</a></div></div>` : '';
    const extraImagesHtml = (post.dataset.extraImages || '')
      .split(',')
      .map((src) => src.trim())
      .filter(Boolean)
      .map((src, index) => `<img class="single-post-img single-post-extra-img" src="${safeText(src)}" alt="${safeText(title)} ${index + 2}" />`)
      .join('');
    const linkHtml = link ? `<a class="single-post-link" href="${safeText(link)}" target="_blank" rel="noopener noreferrer">${safeText(link)}</a>` : '';
    const postKickerHtml = buildPostKicker(post, slug, title, body, link, true);
    detailPage.innerHTML = `
      <article class="single-post-card">
        <div class="single-post-actions">
          <button class="single-back" type="button" id="postDetailBack">← 返回文章列表</button>
        </div>
        <div class="single-post-head">
          ${postKickerHtml}
          <h1>${safeText(title)}</h1>
          <div class="single-meta"><span>日期 ${safeText(date)}</span><span>分类 ${safeText(category)}</span></div>
        </div>
        <img class="single-post-img" src="${safeText(img)}" alt="${safeText(title)}" />
        ${videoHtml}
        ${extraImagesHtml}
        <div class="single-post-content">
          ${body ? `<p>${safeText(body)}</p>` : ''}
          ${linkHtml ? `<div class="single-link-box"><span>原链接</span>${linkHtml}</div>` : ''}
          <div class="tags">${tagsHtml}</div>
        </div>
        <div class="single-post-end-actions">
          <button class="single-share" type="button" id="postDetailShare">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"></path><path d="M12 16V4"></path><path d="M7 9l5-5 5 5"></path></svg>
            <span>分享</span>
          </button>
        </div>
      </article>`;
    detailPage.classList.remove('hidden');
    contentArea?.classList.add('detail-mode');
    allPosts.forEach((item) => item.classList.add('hidden'));
    pagination && (pagination.innerHTML = '');
    $('#postDetailBack')?.addEventListener('click', () => {
      showList(true, false);
      restoreListScrollTop(true);
    });
    $('#postDetailShare')?.addEventListener('click', () => openPostShare({
      slug,
      title,
      date,
      category,
      tags: post.dataset.tags || '',
      body,
      link,
      img,
      url: buildPostShareUrl(slug)
    }));
    if (push) history.pushState({ post: slug, listScroll: getSavedListScrollTop() }, '', `${location.pathname}?post=${encodeURIComponent(slug)}`);
    $('#posts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  allPosts.forEach((post) => {
    post.addEventListener('click', () => openArticle(post));
    post.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openArticle(post); }
    });
  });

  $('#galleryOpen')?.addEventListener('click', () => {
    const galleryItems = allPosts.flatMap((post, index) => {
      const title = $('h3', post)?.textContent || post.dataset.title || '图片分享';
      const cover = $('img', post)?.getAttribute('src') || '';
      const images = [cover, ...(post.dataset.extraImages || '').split(',').map((src) => src.trim()).filter(Boolean)].filter(Boolean);
      return images.map((img, imageIndex) => {
        const label = images.length > 1 ? `${title} · 第${imageIndex + 1}张 · ${post.dataset.date}` : `${title} · ${post.dataset.date}`;
        return `<button class="gallery-item" type="button" data-gallery-index="${index}" data-gallery-image-index="${imageIndex}"><img src="${safeText(img)}" alt="${safeText(label)}" /><span>${safeText(label)}</span></button>`;
      });
    });
    $('#galleryGrid').innerHTML = galleryItems.join('');
    openModal('#galleryModal');
  });
  $('#galleryGrid')?.addEventListener('click', (event) => {
    const item = event.target.closest('[data-gallery-index]');
    if (!item) return;
    closeModal($('#galleryModal'));
    openArticle(allPosts[Number(item.dataset.galleryIndex)]);
  });
  renderPosts();
  const openFromUrl = () => {
    const slug = new URLSearchParams(location.search).get('post');
    if (!slug) {
      if (history.state && typeof history.state.listScroll === 'number') lastListScrollTop = history.state.listScroll;
      showList(false, false);
      if (history.state && typeof history.state.listScroll === 'number') restoreListScrollTop(false);
      return;
    }
    const post = allPosts.find((item) => getPostSlug(item) === slug);
    if (post) openArticle(post, false);
    else showList(false, false);
  };
  window.addEventListener('popstate', openFromUrl);
  openFromUrl();
}


/* 追加：电脑 / Pad 端侧边栏音乐区吸附顶部栏
   作用：侧边栏跟文章一起滚动；滚到音乐模块时，只让 音乐 / 分类 / 标签统计 3 个模块吸附在顶部栏下方。
   修改入口：
   1. 吸附间距：CSS 变量 --sidebar-stick-top
   2. 三个吸附模块：HTML 里的 #sidebarPinGroup
*/
function initDesktopSidebarMusicSticky() {
  const desktop = window.matchMedia('(min-width: 901px)');
  const sidebar = document.querySelector('.sidebar');
  const nav = document.getElementById('siteNav');
  const music = document.getElementById('music');
  const category = document.getElementById('categoryPanel');
  const tags = document.getElementById('tagPanel');

  if (!sidebar || !music || !category || !tags) return;

  // 如果旧 HTML 没有包裹层，这里自动补一个；新版本 HTML 已经自带。
  let pack = sidebar.querySelector('.sidebar-pin-group') || sidebar.querySelector('.sidebar-sticky-pack');
  if (!pack) {
    pack = document.createElement('div');
    pack.className = 'sidebar-pin-group';
    music.insertAdjacentElement('beforebegin', pack);
    pack.append(music, category, tags);
  } else {
    pack.classList.add('sidebar-pin-group');
    pack.classList.remove('sidebar-sticky-pack');
  }

  const updateSidebarStickyTop = () => {
    if (!desktop.matches) {
      document.documentElement.style.setProperty('--sidebar-stick-top', '0px');
      return;
    }

    const navVisible = nav && !nav.classList.contains('nav-collapsed-top');
    const navHeight = navVisible ? Math.max(0, Math.round(nav.getBoundingClientRect().height)) : 0;
    const safeTop = Math.max(28, navHeight + 30);
    document.documentElement.style.setProperty('--sidebar-stick-top', `${safeTop}px`);
  };

  const sync = () => {
    document.body.classList.toggle('desktop-sidebar-pin-ready', desktop.matches);
    updateSidebarStickyTop();
  };

  sync();
  desktop.addEventListener?.('change', sync);
  window.addEventListener('resize', sync, { passive: true });
  window.addEventListener('scroll', updateSidebarStickyTop, { passive: true });
}


/* 09 Init */
function initModals() {
  $$('[data-close-modal]').forEach((btn) => btn.addEventListener('click', () => closeModal(btn.closest('.modal'))));
  $$('.modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); }));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') $$('.modal.show').forEach(closeModal); });
  $('#notice')?.addEventListener('click', (event) => { if (!event.target.closest('a')) openModal('#noticeModal'); });
}


function initImageLightbox() {
  const ensure = () => {
    let modal = $('#imageLightboxModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'modal image-lightbox-modal';
    modal.id = 'imageLightboxModal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="image-lightbox-card" role="dialog" aria-modal="true" aria-label="查看大图">
        <button class="modal-close image-lightbox-close" type="button" aria-label="关闭">×</button>
        <img id="imageLightboxImg" src="" alt="查看大图" />
        <div class="image-lightbox-caption" id="imageLightboxCaption"></div>
      </div>`;
    document.body.appendChild(modal);
    const close = () => closeModal(modal);
    $('.image-lightbox-close', modal)?.addEventListener('click', close);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });
    return modal;
  };
  document.addEventListener('click', (event) => {
    const img = event.target.closest('.single-post-card .single-post-img');
    if (!img) return;
    if (event.target.closest('a, button, .single-share')) return;
    event.preventDefault();
    event.stopPropagation();
    const modal = ensure();
    const modalImg = $('#imageLightboxImg', modal);
    const caption = $('#imageLightboxCaption', modal);
    const rawSrc = img.currentSrc || img.src || img.getAttribute('src') || '';
    if (modalImg) {
      modalImg.src = rawSrc;
      modalImg.alt = img.alt || '查看大图';
    }
    if (caption) caption.textContent = img.alt || '点击空白处关闭';
    openModal(modal);
  }, true);
}

function initVideoFallback() {
  document.addEventListener('error', (event) => {
    const video = event.target?.closest?.('.single-post-video');
    if (!video) return;
    video.closest('.single-video-wrap')?.classList.add('video-error');
  }, true);
  document.addEventListener('loadeddata', (event) => {
    const video = event.target?.closest?.('.single-post-video');
    if (!video) return;
    video.closest('.single-video-wrap')?.classList.remove('video-error');
  }, true);
}

function initFooterStats() {
  const articleCount = $$('.post').length;
  const startTime = new Date(CONFIG.siteStartDate).getTime();
  const updateFooterStats = () => {
    const elapsed = Date.now() - startTime;
    const days = Math.max(1, Math.ceil(elapsed / 86400000));
    $('#runFooter') && ($('#runFooter').textContent = fmtRunTime(elapsed));
    $('#lastVisit') && ($('#lastVisit').textContent = '2026-06-15');
    $('#siteInfoArticleCount') && ($('#siteInfoArticleCount').textContent = String(articleCount));
    $('#siteInfoRunDays') && ($('#siteInfoRunDays').textContent = String(days));
  };
  updateFooterStats();
  window.setInterval(updateFooterStats, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  initThemePalette();
  initTyping();
  initStars();
  initMeteors();
  initNavigation();
  initDesktopSidebarMusicSticky();
  initMusic();
  initPostsGallery();
  initModals();
  initImageLightbox();
  initVideoFallback();
  initFooterStats();
});

// v38 new haircut post: index.html data updated.

// v40 message page: Waline serverURL set to example.easonzhan.xyz.

// v44 message page music state restore from v40 base.

// v45 message page topbar music safe restore, no SPA freeze.
