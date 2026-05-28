(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (menuButton && panel) {
        menuButton.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    var grids = document.querySelectorAll('.filter-grid');
    grids.forEach(function (grid) {
        var shell = grid.closest('.page-shell');
        if (!shell) {
            return;
        }
        var input = shell.querySelector('.filter-input');
        var select = shell.querySelector('.sort-select');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var original = cards.slice();

        function applyFilter() {
            var q = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.category,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.tags
                ].join(' '));
                card.classList.toggle('is-hidden-card', q && haystack.indexOf(q) === -1);
            });
        }

        function applySort() {
            var value = select ? select.value : 'default';
            var sorted = original.slice();
            if (value === 'score') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.score) - Number(a.dataset.score);
                });
            }
            if (value === 'views') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.views) - Number(a.dataset.views);
                });
            }
            if (value === 'year') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.year) - Number(a.dataset.year);
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
            cards = sorted;
            applyFilter();
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (select) {
            select.addEventListener('change', applySort);
        }
    });
})();
