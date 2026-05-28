(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.getElementById('hero-slider');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var active = 0;
    var timer = null;

    function showSlide(index) {
      active = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function nextSlide() {
      if (slides.length > 0) {
        showSlide((active + 1) % slides.length);
      }
    }

    function startTimer() {
      timer = window.setInterval(nextSlide, 5000);
    }

    function resetTimer() {
      window.clearInterval(timer);
      startTimer();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-target')) || 0;
        showSlide(index);
        resetTimer();
      });
    });

    startTimer();
  }

  var searchInput = document.querySelector('.site-search');
  var yearSelect = document.querySelector('.filter-select');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
  var emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  }

  function runFilter() {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var matchKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      var show = matchKeyword && matchYear;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (searchInput || yearSelect) {
    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var initialKeyword = params.get('q');
      if (initialKeyword) {
        searchInput.value = initialKeyword;
      }
      searchInput.addEventListener('input', runFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', runFilter);
    }

    runFilter();
  }
})();
