(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function attachSource(video, src) {
        if (video.dataset.ready === '1') {
            return Promise.resolve();
        }
        video.dataset.ready = '1';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
            return Promise.resolve();
        }
        video.src = src;
        return Promise.resolve();
    }

    function setupPlayer(box) {
        var video = box.querySelector('.movie-video');
        var button = box.querySelector('.player-start');
        var src = box.getAttribute('data-video-src');
        if (!video || !button || !src) {
            return;
        }

        function start() {
            attachSource(video, src).then(function () {
                button.classList.add('is-hidden');
                video.controls = true;
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            });
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!video.currentSrc) {
                start();
            }
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
    }

    ready(function () {
        document.querySelectorAll('.player-box').forEach(setupPlayer);
    });
})();
