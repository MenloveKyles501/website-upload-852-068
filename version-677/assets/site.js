(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                toggle.textContent = open ? "×" : "☰";
            });
        }

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-index]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
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

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-index")) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll(".movie-filter").forEach(function (form) {
            var root = form.closest("section") || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll(".filter-results .movie-card"));
            var search = form.querySelector("[data-search]");
            var type = form.querySelector("[data-type-filter]");
            var year = form.querySelector("[data-year-filter]");
            var region = form.querySelector("[data-region-filter]");
            var empty = root.querySelector("[data-empty-state]");

            function value(node) {
                return node ? node.value.trim().toLowerCase() : "";
            }

            function apply() {
                var q = value(search);
                var t = value(type);
                var y = value(year);
                var r = value(region);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region")
                    ].join(" ").toLowerCase();
                    var ok = true;

                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (t && valueFrom(card, "data-type") !== t) {
                        ok = false;
                    }
                    if (y && valueFrom(card, "data-year") !== y) {
                        ok = false;
                    }
                    if (r && valueFrom(card, "data-region") !== r) {
                        ok = false;
                    }

                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            function valueFrom(card, attr) {
                return (card.getAttribute(attr) || "").trim().toLowerCase();
            }

            [search, type, year, region].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });
        });

        document.querySelectorAll(".js-player").forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".play-overlay");
            var src = shell.getAttribute("data-src");
            var hls = null;
            var loaded = false;

            function begin() {
                if (!video || !src) {
                    return;
                }

                shell.classList.add("is-playing");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (!loaded) {
                        video.src = src;
                        loaded = true;
                    }
                    video.play().catch(function () {});
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (!hls) {
                        hls = new window.Hls();
                        hls.loadSource(src);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else {
                        video.play().catch(function () {});
                    }
                    loaded = true;
                    return;
                }

                if (!loaded) {
                    video.src = src;
                    loaded = true;
                }
                video.play().catch(function () {});
            }

            if (button) {
                button.addEventListener("click", begin);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (!loaded || video.paused) {
                        begin();
                    }
                });
                video.addEventListener("play", function () {
                    shell.classList.add("is-playing");
                });
            }
        });
    });
}());
