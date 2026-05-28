
(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
        '<div class="poster-wrap">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3>' + escapeHtml(movie.title) + '</h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="card-meta">' +
            '<span>★ ' + escapeHtml(movie.rating) + '</span>' +
            '<span>' + escapeHtml(movie.year) + '</span>' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
          '</div>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</a>';
  }

  function searchMovies(keyword) {
    var term = keyword.toLowerCase();
    if (!term) {
      return (window.siteMovies || []).slice(0, 18);
    }

    return (window.siteMovies || []).filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return haystack.indexOf(term) !== -1;
    }).slice(0, 120);
  }

  function render() {
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');

    if (!input || !results || !status) {
      return;
    }

    var keyword = getQuery();
    input.value = keyword;

    if (!keyword) {
      return;
    }

    var matches = searchMovies(keyword);
    status.textContent = matches.length ? '搜索结果：' + keyword : '未找到相关影片：' + keyword;
    results.innerHTML = matches.length ? matches.map(cardTemplate).join('') : '<p class="empty-result">换一个关键词继续搜索。</p>';
  }

  document.addEventListener('DOMContentLoaded', render);
})();
