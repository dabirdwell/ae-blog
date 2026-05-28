(function() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  let index = null;
  fetch('/index.json').then(r => r.json()).then(data => { index = data; });

  input.addEventListener('input', function() {
    if (!index) return;
    const q = this.value.toLowerCase().trim();
    if (q.length < 2) { results.innerHTML = ''; return; }

    const matches = index.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );

    results.innerHTML = matches.length === 0
      ? '<p class="no-results">Nothing found.</p>'
      : matches.map(p => `
        <article class="post-summary">
          <h3><a href="${p.url}">${p.title}</a></h3>
          <time>${p.date}</time>
          ${p.description ? `<p>${p.description}</p>` : ''}
          <div class="post-tags">${(p.tags||[]).map(t => `<a href="/tags/${t}/" class="tag">#${t}</a>`).join(' ')}</div>
        </article>
      `).join('');
  });
})();

// Reading progress bar
(function() {
  var bar = document.getElementById('progress');
  if (!bar) return;
  window.addEventListener('scroll', function() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h * 100) : 0) + '%';
  });
})();
