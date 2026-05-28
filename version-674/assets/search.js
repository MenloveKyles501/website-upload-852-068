(function () {
    function esc(value) {
        return String(value || '').replace(/[&<>"]/g, function (ch) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[ch];
        });
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + esc(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="movie-thumb" href="' + esc(movie.href) + '">' +
            '<img src="' + esc(movie.cover) + '" alt="' + esc(movie.title) + '" loading="lazy">' +
            '<span class="movie-score">' + esc(movie.score) + '</span>' +
            '<span class="movie-play">▶</span>' +
            '</a>' +
            '<div class="movie-info">' +
            '<div class="movie-meta-row"><span>' + esc(movie.year) + '</span><span>' + esc(movie.region) + '</span><span>' + esc(movie.type) + '</span></div>' +
            '<h3><a href="' + esc(movie.href) + '">' + esc(movie.title) + '</a></h3>' +
            '<p>' + esc(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</article>';
    }

    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = document.getElementById('search-input');
    var title = document.getElementById('search-title');
    var desc = document.getElementById('search-desc');
    var results = document.getElementById('search-results');
    var data = window.SEARCH_MOVIES || [];

    if (input) {
        input.value = q;
    }

    function render(query) {
        var key = query.toLowerCase();
        var list = data;
        if (key) {
            list = data.filter(function (movie) {
                return [movie.title, movie.region, movie.type, movie.genre, movie.category, movie.year, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase().indexOf(key) !== -1;
            });
        } else {
            list = data.slice(0, 24);
        }
        if (title) {
            title.textContent = key ? '搜索结果：' + query : '热门搜索';
        }
        if (desc) {
            desc.textContent = key ? '为你匹配到相关影片入口。' : '可按影片标题、题材标签、地区或年份进行检索。';
        }
        if (results) {
            results.innerHTML = list.slice(0, 80).map(card).join('');
        }
    }

    render(q);
})();
