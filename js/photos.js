(async function loadPhotos() {
  const rails = document.querySelectorAll('.photo-rail[data-section]');
  if (rails.length === 0) return;

  let data;
  try {
    const res = await fetch('photos.json', { cache: 'no-store' });
    data = await res.json();
  } catch (err) {
    console.error('Failed to load photos.json:', err);
    return;
  }

  rails.forEach((rail) => {
    const section = rail.dataset.section;
    const items = Array.isArray(data[section]) ? data[section] : [];
    rail.replaceChildren(
      ...items.map((item) => {
        const fig = document.createElement('figure');
        fig.className = 'tile';
        if (item.image) {
          const img = document.createElement('img');
          img.src = item.image;
          img.alt = item.caption || '';
          img.loading = 'lazy';
          img.decoding = 'async';
          img.fetchPriority = 'low';
          img.width = 400;
          img.height = 400;
          img.onerror = () => img.remove();
          fig.appendChild(img);
        }
        const cap = document.createElement('figcaption');
        cap.textContent = item.caption || '';
        fig.appendChild(cap);
        return fig;
      })
    );
  });
})();
