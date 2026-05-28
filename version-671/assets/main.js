(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilter(root) {
    var input = root.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-filter]'));
    var empty = root.querySelector('[data-no-results]');
    var active = 'all';

    function apply() {
      var q = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var category = card.getAttribute('data-category') || '';
        var matchedText = !q || text.indexOf(q) !== -1;
        var matchedCategory = active === 'all' || category === active;
        var show = matchedText && matchedCategory;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(setupFilter);

  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var src = shell.getAttribute('data-stream');
    var hls = null;

    if (!video || !src) {
      return;
    }

    function load() {
      if (video.getAttribute('data-loaded') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      video.setAttribute('data-loaded', 'true');
      video.setAttribute('controls', 'controls');
    }

    function start() {
      load();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playback = video.play();
      if (playback && playback.catch) {
        playback.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused || video.getAttribute('data-loaded') !== 'true') {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(setupPlayer);
})();

(function () {
  var params = new URLSearchParams(window.location.search);
  var value = params.get('q');
  if (!value) {
    return;
  }
  var input = document.querySelector('[data-search-input]');
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
})();
