(function () {
    function getRoot() {
        return document.body.getAttribute("data-root") || "./";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
            document.body.classList.toggle("menu-open", panel.classList.contains("open"));
        });
    }

    function initSearchForms() {
        var root = getRoot();
        document.querySelectorAll(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                if (query) {
                    window.location.href = root + "search.html?q=" + encodeURIComponent(query);
                }
            });
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 6200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        show(0);
        start();
    }

    function initFilters() {
        var input = document.getElementById("library-search");
        var category = document.getElementById("library-category");
        var type = document.getElementById("library-type");
        var year = document.getElementById("library-year");
        var reset = document.getElementById("library-reset");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var empty = document.querySelector("[data-empty-state]");
        if (!cards.length || (!input && !category && !type && !year)) {
            return;
        }

        function normalize(value) {
            return String(value || "").toLowerCase();
        }

        function apply() {
            var query = normalize(input ? input.value.trim() : "");
            var categoryValue = category ? category.value : "";
            var typeValue = type ? type.value : "";
            var yearValue = year ? year.value : "";
            var shown = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.year
                ].join(" "));
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchCategory = !categoryValue || card.dataset.category === categoryValue;
                var matchType = !typeValue || card.dataset.type === typeValue;
                var matchYear = !yearValue || card.dataset.year === yearValue;
                var visible = matchQuery && matchCategory && matchType && matchYear;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", shown === 0);
            }
        }

        [input, category, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });

        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (category) {
                    category.value = "";
                }
                if (type) {
                    type.value = "";
                }
                if (year) {
                    year.value = "";
                }
                apply();
            });
        }

        apply();
    }

    function initSearchPage() {
        var container = document.getElementById("search-results");
        var title = document.getElementById("search-title");
        if (!container || !window.searchMovies) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var root = getRoot();
        if (title) {
            title.textContent = query ? "搜索：" + query : "影片搜索";
        }
        if (!query) {
            container.innerHTML = '<div class="empty-state show">请输入关键词搜索影片。</div>';
            return;
        }
        var queryLower = query.toLowerCase();
        var results = window.searchMovies.filter(function (movie) {
            return [movie.title, movie.region, movie.type, movie.genre, movie.year, movie.oneLine]
                .join(" ")
                .toLowerCase()
                .indexOf(queryLower) !== -1;
        }).slice(0, 120);
        if (!results.length) {
            container.innerHTML = '<div class="empty-state show">没有找到匹配影片。</div>';
            return;
        }
        container.innerHTML = results.map(function (movie) {
            return [
                '<article class="search-result">',
                '    <a href="' + root + movie.url + '"><img src="' + root + movie.cover + '" alt="' + escapeHtml(movie.title) + '"></a>',
                '    <div>',
                '        <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
                '        <h2><a href="' + root + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '    </div>',
                '</article>'
            ].join("\n");
        }).join("\n");
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initSearchPage();
    });
}());

function createHlsPlayer(videoId, sourceUrl, overlayId, buttonId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var ready = false;

    if (!video || !button) {
        return;
    }

    function showError() {
        if (overlay) {
            overlay.innerHTML = '<div class="player-error">视频暂时无法播放</div>';
            overlay.classList.remove("hidden");
        }
    }

    function bindSource() {
        if (ready) {
            return;
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showError();
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else {
            showError();
        }
    }

    function playVideo() {
        bindSource();
        video.controls = true;
        if (overlay) {
            overlay.classList.add("hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("hidden");
                }
            });
        }
    }

    button.addEventListener("click", playVideo);
    if (overlay) {
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                playVideo();
            }
        });
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });
}
