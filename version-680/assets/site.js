(() => {
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root = document) => root.querySelector(sel);

  function initMobileMenu() {
    const toggle = $('[data-menu-toggle]');
    const panel = $('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(el => io.observe(el));
  }

  function initHeroSlider() {
    const slider = $('[data-hero-slider]');
    if (!slider) return;
    const slides = $$('[data-slide]', slider);
    if (slides.length <= 1) return;
    const dotsWrap = $('[data-hero-dots]');
    let index = 0;
    let timer = null;

    const dots = slides.map((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'hero-dot';
      btn.type = 'button';
      btn.setAttribute('aria-label', `切换到第 ${i + 1} 张`);
      btn.addEventListener('click', () => show(i, true));
      dotsWrap && dotsWrap.appendChild(btn);
      return btn;
    });

    function show(i, userAction = false) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
      if (userAction) restart();
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5500);
    }

    slider.addEventListener('mouseenter', () => timer && clearInterval(timer));
    slider.addEventListener('mouseleave', restart);
    show(0);
    restart();
  }

  function loadHlsScript(cb) {
    if (window.Hls) {
      cb();
      return;
    }
    if (document.querySelector('script[data-hls-loader]')) {
      const check = setInterval(() => {
        if (window.Hls) {
          clearInterval(check);
          cb();
        }
      }, 100);
      setTimeout(() => clearInterval(check), 5000);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    s.async = true;
    s.dataset.hlsLoader = '1';
    s.onload = () => cb();
    document.head.appendChild(s);
  }

  function initPlayer() {
    const wrap = $('[data-player-wrap]');
    const video = $('[data-player-video]');
    const floatPlay = $('[data-player-overlay]');
    if (!wrap || !video) return;

    const m3u8 = video.dataset.m3u8;
    const mp4 = video.dataset.mp4;

    const startVideo = () => {
      const canNativeHls = video.canPlayType('application/vnd.apple.mpegurl');
      if (m3u8 && canNativeHls) {
        video.src = m3u8;
      } else if (m3u8 && window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(m3u8);
        hls.attachMedia(video);
        window.__movieHls = hls;
      } else {
        video.src = mp4 || video.src;
      }
    };

    startVideo();

    const toggle = () => {
      if (video.paused) {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else {
        video.pause();
      }
    };

    if (floatPlay) {
      floatPlay.addEventListener('click', toggle);
    }
    wrap.addEventListener('click', (e) => {
      if (e.target === video) return;
      toggle();
    });
    video.addEventListener('click', toggle);
    video.addEventListener('play', () => floatPlay && floatPlay.classList.add('hidden'));
    video.addEventListener('pause', () => floatPlay && floatPlay.classList.remove('hidden'));
    video.addEventListener('ended', () => floatPlay && floatPlay.classList.remove('hidden'));

    if (m3u8 && !video.src) {
      loadHlsScript(() => {
        if (!video.src) startVideo();
      });
    }
  }

  function movieCard(item) {
    const chips = (item.genres || []).slice(0, 2).map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('');
    return `
      <article class="movie-card" data-reveal>
        <a class="card-link" href="${escapeAttr(item.url)}" aria-label="${escapeAttr(item.title)}"></a>
        <div class="poster">
          <img src="${escapeAttr(item.poster)}" alt="${escapeAttr(item.title)}海报" loading="lazy">
          <span class="poster-badge">${escapeHtml(item.category || '')}</span>
          <span class="poster-score">${escapeHtml(item.score.toFixed ? item.score.toFixed(1) : item.score)}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          <div class="card-meta">
            <span>${escapeHtml(item.region || '')}</span>
            <span>·</span>
            <span>${escapeHtml(item.type || '')}</span>
            <span>·</span>
            <span>${escapeHtml(item.year || '')}</span>
          </div>
          <p class="card-desc">${escapeHtml(item.one_line || item.summary || '')}</p>
          <div class="chips">${chips}</div>
        </div>
      </article>
    `;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return escapeHtml(text).replace(/"/g, '&quot;');
  }

  function initSearchPage() {
    const page = $('[data-search-page]');
    if (!page) return;

    const input = $('[data-search-input]', page);
    const category = $('[data-search-category]', page);
    const sort = $('[data-search-sort]', page);
    const results = $('[data-search-results]', page);
    const summary = $('[data-search-summary]', page);
    const pagination = $('[data-search-pagination]', page);
    const totalNode = $('[data-search-total]', page);
    const initialQ = new URLSearchParams(location.search).get('q') || '';
    if (input) input.value = initialQ;

    let data = [];
    let filtered = [];
    let pageNo = 1;
    const pageSize = 30;

    const state = {
      q: initialQ,
      category: '',
      sort: 'score-desc'
    };

    fetch('assets/movies.json', { cache: 'force-cache' })
      .then(r => r.json())
      .then(json => {
        data = json || [];
        const cats = [...new Set(data.map(x => x.category).filter(Boolean))];
        if (category) {
          cats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            category.appendChild(opt);
          });
        }
        bind();
        render();
      })
      .catch(() => {
        if (summary) summary.textContent = '搜索索引加载失败，请稍后刷新页面。';
      });

    function bind() {
      input && input.addEventListener('input', debounce(() => {
        state.q = input.value.trim();
        pageNo = 1;
        render();
      }, 150));
      category && category.addEventListener('change', () => {
        state.category = category.value;
        pageNo = 1;
        render();
      });
      sort && sort.addEventListener('change', () => {
        state.sort = sort.value;
        pageNo = 1;
        render();
      });
    }

    function filterData() {
      const q = state.q.toLowerCase();
      filtered = data.filter(item => {
        const hay = [
          item.title,
          item.one_line,
          item.summary,
          item.region,
          item.type,
          item.year,
          (item.genres || []).join(' '),
          (item.tags || []).join(' '),
          item.category
        ].join(' ').toLowerCase();
        const matchQ = !q || hay.includes(q);
        const matchCat = !state.category || item.category === state.category;
        return matchQ && matchCat;
      });

      switch (state.sort) {
        case 'year-desc':
          filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0) || b.score - a.score);
          break;
        case 'title-asc':
          filtered.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
          break;
        default:
          filtered.sort((a, b) => (b.score || 0) - (a.score || 0) || (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
      }
    }

    function renderPager(totalPages) {
      pagination.innerHTML = '';
      const maxButtons = 7;
      const half = Math.floor(maxButtons / 2);
      let start = Math.max(1, pageNo - half);
      let end = Math.min(totalPages, start + maxButtons - 1);
      start = Math.max(1, end - maxButtons + 1);

      const mk = (label, target, disabled = false, active = false) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        if (active) btn.classList.add('active');
        btn.disabled = disabled;
        btn.addEventListener('click', () => {
          pageNo = target;
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pagination.appendChild(btn);
      };

      mk('上一页', Math.max(1, pageNo - 1), pageNo === 1);
      if (start > 1) mk('1', 1);
      if (start > 2) {
        const span = document.createElement('span');
        span.className = 'muted';
        span.textContent = '…';
        pagination.appendChild(span);
      }
      for (let i = start; i <= end; i++) mk(String(i), i, false, i === pageNo);
      if (end < totalPages - 1) {
        const span = document.createElement('span');
        span.className = 'muted';
        span.textContent = '…';
        pagination.appendChild(span);
      }
      if (end < totalPages) mk(String(totalPages), totalPages);
      mk('下一页', Math.min(totalPages, pageNo + 1), pageNo === totalPages);
    }

    function render() {
      if (!data.length) return;
      filterData();
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      pageNo = Math.min(pageNo, totalPages);
      const slice = filtered.slice((pageNo - 1) * pageSize, pageNo * pageSize);

      if (results) {
        results.innerHTML = slice.map(movieCard).join('');
      }
      if (summary) {
        const q = state.q ? `“${state.q}”` : '全部内容';
        const cat = state.category ? ` · ${state.category}` : '';
        summary.textContent = `共找到 ${total} 部影片，当前显示第 ${pageNo} / ${totalPages} 页。${q}${cat}`;
      }
      if (totalNode) totalNode.textContent = total;
      renderPager(totalPages);
      initReveal();
    }
  }

  function initFilters() {
    const q = $('[data-filter-form]');
    if (!q) return;
    const fields = $$('[data-filter-field]', q);
    if (!fields.length) return;
    // reserved for future pages
  }

  function initFooterYear() {
    $$('[data-current-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  function debounce(fn, wait) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initReveal();
    initHeroSlider();
    initPlayer();
    initSearchPage();
    initFilters();
    initFooterYear();
  });
})();
