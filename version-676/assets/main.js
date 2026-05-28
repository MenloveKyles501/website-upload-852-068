(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobileNav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.setAttribute('aria-pressed', dotIndex === active ? 'true' : 'false');
      });
    }

    function startHero() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(active + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')));
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var searchInput = root.querySelector('[data-filter-search]');
    var typeInput = root.querySelector('[data-filter-type]');
    var yearInput = root.querySelector('[data-filter-year]');
    var categoryInput = root.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var emptyState = root.querySelector('[data-empty-state]');

    function normalized(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalized(searchInput && searchInput.value);
      var type = normalized(typeInput && typeInput.value);
      var year = normalized(yearInput && yearInput.value);
      var category = normalized(categoryInput && categoryInput.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var search = normalized(card.getAttribute('data-search'));
        var cardType = normalized(card.getAttribute('data-type'));
        var cardYear = normalized(card.getAttribute('data-year'));
        var cardCategory = normalized(card.getAttribute('data-category'));
        var matched = true;

        if (keyword && search.indexOf(keyword) === -1) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [searchInput, typeInput, yearInput, categoryInput].forEach(function (input) {
      if (!input) {
        return;
      }
      input.addEventListener('input', applyFilter);
      input.addEventListener('change', applyFilter);
    });
  });

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var trigger = player.querySelector('[data-play-trigger]');
    var streamUrl = player.getAttribute('data-stream');
    var hlsInstance = null;

    function attachStream() {
      if (!video || !streamUrl || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
      attachStream();
      player.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    attachStream();

    if (trigger) {
      trigger.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
