
(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupHeader() {
    var searchToggle = document.querySelector('[data-search-toggle]');
    var searchPanel = document.querySelector('[data-search-panel]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener('click', function () {
        searchPanel.classList.toggle('is-open');
        if (mobileNav) {
          mobileNav.classList.remove('is-open');
        }
        var input = searchPanel.querySelector('input');
        if (searchPanel.classList.contains('is-open') && input) {
          input.focus();
        }
      });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
        if (searchPanel) {
          searchPanel.classList.remove('is-open');
        }
      });
    }
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    if (slides.length > 1) {
      startTimer();
    }
  }

  function setupLocalFilters() {
    var input = document.querySelector('[data-filter-input]');
    var cards = selectAll('[data-filter-card]');
    var chips = selectAll('[data-filter-chip]');

    if (!input || cards.length === 0) {
      return;
    }

    function filterCards(keyword) {
      var term = (keyword || '').trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
        card.classList.toggle('hidden-card', term && haystack.indexOf(term) === -1);
      });
    }

    input.addEventListener('input', function () {
      filterCards(input.value);
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        input.value = chip.getAttribute('data-filter-chip') || '';
        filterCards(input.value);
        input.focus();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHeader();
    setupHero();
    setupLocalFilters();
  });
})();
