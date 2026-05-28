(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setMessage(shell, text) {
    var message = shell.querySelector('[data-video-message]');
    if (message) {
      message.textContent = text;
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        if (window.Hls) {
          resolve();
        }
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initVideoPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-play-video]');
    var videoUrl = shell.getAttribute('data-video-url');

    if (!video || !overlay || !videoUrl) {
      return;
    }

    function startPlayback() {
      overlay.disabled = true;
      setMessage(shell, '正在初始化高清播放源…');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        shell.classList.add('is-playing');
        video.play().catch(function () {
          setMessage(shell, '浏览器已加载播放源，请再次点击视频播放。');
        });
        return;
      }

      loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js')
        .then(function () {
          if (!window.Hls || !window.Hls.isSupported()) {
            setMessage(shell, '当前浏览器不支持 HLS 播放，请更换浏览器访问。');
            overlay.disabled = false;
            return;
          }

          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            shell.classList.add('is-playing');
            setMessage(shell, '播放源已就绪。');
            video.play().catch(function () {
              setMessage(shell, '播放源已就绪，请再次点击视频播放。');
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage(shell, '播放源加载遇到问题，可刷新页面后重试。');
              overlay.disabled = false;
              shell.classList.remove('is-playing');
              hls.destroy();
            }
          });
        })
        .catch(function () {
          setMessage(shell, 'HLS 播放组件加载失败，请检查网络后重试。');
          overlay.disabled = false;
        });
    }

    overlay.addEventListener('click', startPlayback);
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initMobileNav() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initLocalFilter() {
    var scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }

    var input = scope.querySelector('[data-local-search]');
    var clear = scope.querySelector('[data-clear-filter]');
    var count = scope.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var activeYear = '';
    var activeGenre = '';

    function normalize(text) {
      return String(text || '').toLowerCase().trim();
    }

    function updateActiveButtons(button) {
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('.filter-chips button'));
      buttons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region')
        ].join(' '));
        var year = card.getAttribute('data-year') || '';
        var genre = card.getAttribute('data-genre') || '';
        var matched = (!query || haystack.indexOf(query) !== -1) &&
          (!activeYear || year === activeYear) &&
          (!activeGenre || genre.indexOf(activeGenre) !== -1);

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
    }

    scope.querySelectorAll('[data-filter-year]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year') || '';
        activeGenre = '';
        updateActiveButtons(button);
        apply();
      });
    });

    scope.querySelectorAll('[data-filter-genre]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeGenre = button.getAttribute('data-filter-genre') || '';
        activeYear = '';
        updateActiveButtons(button);
        apply();
      });
    });

    var allButton = scope.querySelector('[data-filter-all]');
    if (allButton) {
      allButton.addEventListener('click', function () {
        activeYear = '';
        activeGenre = '';
        updateActiveButtons(allButton);
        apply();
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        activeYear = '';
        activeGenre = '';
        if (allButton) {
          updateActiveButtons(allButton);
        }
        apply();
      });
    }

    apply();
  }

  function renderSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card">' +
        '<a class="poster-wrap" href="./' + movie.file + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<img src="./' + movie.coverNo + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.closest(\'.poster-wrap\').classList.add(\'is-missing\'); this.remove();">' +
          '<span class="poster-fallback">' + escapeHtml(movie.title) + '</span>' +
          '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>' +
          '<span class="play-badge" aria-hidden="true">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<a class="movie-title" href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a>' +
          '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="meta-row">' +
            '<span>' + escapeHtml(movie.year) + '</span>' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
            '<span>' + escapeHtml(movie.viewsLabel) + '观看</span>' +
          '</div>' +
          '<div class="tag-row">' +
            '<a href="./category-' + movie.categorySlug + '.html">' + escapeHtml(movie.categoryName) + '</a>' + tags +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var data = window.MOVIE_SEARCH_DATA;
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    var count = document.querySelector('[data-search-count]');
    var form = document.querySelector('[data-search-form]');

    if (!data || !results || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function normalize(text) {
      return String(text || '').toLowerCase().trim();
    }

    function runSearch(query) {
      var words = normalize(query).split(/\s+/).filter(Boolean);
      var matched = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.categoryName,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' '));
        return words.length === 0 ? false : words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 96);

      if (count) {
        count.textContent = matched.length;
      }

      if (!words.length) {
        results.innerHTML = '<p class="empty-state">请输入关键词搜索，或点击上方快捷筛选。</p>';
        return;
      }

      if (!matched.length) {
        results.innerHTML = '<p class="empty-state">没有找到匹配影片，请尝试更换关键词。</p>';
        return;
      }

      results.innerHTML = matched.map(renderSearchCard).join('');
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        history.replaceState(null, '', './search.html?q=' + encodeURIComponent(query));
        runSearch(query);
      });
    }

    document.querySelectorAll('[data-preset]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-preset') || '';
        runSearch(input.value);
      });
    });

    input.addEventListener('input', function () {
      runSearch(input.value);
    });

    runSearch(initialQuery);
  }

  ready(function () {
    initMobileNav();
    initHeroCarousel();
    initLocalFilter();
    initSearchPage();
    document.querySelectorAll('.video-shell').forEach(initVideoPlayer);
  });
})();
