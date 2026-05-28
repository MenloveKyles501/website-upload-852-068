(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function textValue(element, selector) {
        var field = element.querySelector(selector);
        return field ? field.value.trim().toLowerCase() : '';
    }

    function selectedValue(element, selector) {
        var field = element.querySelector(selector);
        return field ? field.value.trim().toLowerCase() : '';
    }

    function matchValue(value, target) {
        return !value || String(target || '').toLowerCase().indexOf(value) !== -1;
    }

    function applyFilter(form) {
        var list = document.querySelector('[data-filter-list]');
        var empty = document.querySelector('[data-empty-state]');

        if (!list) {
            return;
        }

        var keyword = textValue(form, '.filter-search');
        var region = textValue(form, '.filter-region');
        var year = textValue(form, '.filter-year');
        var channel = selectedValue(form, '.filter-channel');
        var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-row'));
        var visibleCount = 0;

        items.forEach(function (item) {
            var haystack = [
                item.getAttribute('data-title'),
                item.getAttribute('data-region'),
                item.getAttribute('data-year'),
                item.getAttribute('data-type'),
                item.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            var isVisible = matchValue(keyword, haystack) &&
                matchValue(region, item.getAttribute('data-region')) &&
                matchValue(year, item.getAttribute('data-year')) &&
                matchValue(channel, item.getAttribute('data-channel'));

            item.classList.toggle('is-hidden', !isVisible);

            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]')).forEach(function (form) {
        form.addEventListener('input', function () {
            applyFilter(form);
        });
        form.addEventListener('change', function () {
            applyFilter(form);
        });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter(form);
        });
        applyFilter(form);
    });

    window.MoviePlayer = {
        init: function (url) {
            var video = document.getElementById('movie-player');
            var overlay = document.getElementById('play-overlay');
            var hls = null;
            var ready = false;

            if (!video || !overlay || !url) {
                return;
            }

            function attach() {
                if (ready) {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    ready = true;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    ready = true;
                    return;
                }

                video.src = url;
                ready = true;
            }

            function start() {
                attach();
                overlay.classList.add('is-hidden');
                video.controls = true;
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            }

            overlay.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
            video.addEventListener('ended', function () {
                overlay.classList.remove('is-hidden');
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };
})();
