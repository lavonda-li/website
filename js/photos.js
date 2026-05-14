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

  // "images/<dir>/<name>.<ext>" → "images/<dir>/thumbs/<name>.webp".
  const thumbWebp = (src) => {
    const dot = src.lastIndexOf('.');
    const slash = src.lastIndexOf('/');
    if (dot < 0 || slash < 0 || dot < slash) return src;
    return `${src.slice(0, slash)}/thumbs/${src.slice(slash + 1, dot)}.webp`;
  };

  const buildTile = (item, isFeature) => {
    const fig = document.createElement('figure');
    fig.className = isFeature ? 'tile feature' : 'tile';
    if (item.caption) {
      fig.classList.add('has-caption');
    }
    if (item.image) {
      // Feature uses the full-resolution original; other tiles use the WebP thumb.
      const primary = isFeature ? item.image : thumbWebp(item.image);
      const img = document.createElement('img');
      img.src = primary;
      img.alt = item.caption || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.fetchPriority = isFeature ? 'high' : 'low';
      const size = isFeature ? 800 : 400;
      img.width = size;
      img.height = size;
      // If a thumb is missing (e.g. a freshly added photo before regen), fall back to the original.
      img.onerror = () => {
        if (img.dataset.fallback || img.src === item.image) {
          img.remove();
          return;
        }
        img.dataset.fallback = '1';
        img.src = item.image;
      };
      fig.appendChild(img);
    }
    const cap = document.createElement('figcaption');
    cap.textContent = item.caption || '';
    fig.appendChild(cap);
    return fig;
  };

  // Feature is always the first item with an image; placeholders trail.
  const renderRail = (rail, imageItems, placeholderItems) => {
    const ordered = [...imageItems, ...placeholderItems];
    rail.replaceChildren(
      ...ordered.map((item, i) => buildTile(item, i === 0 && !!item.image))
    );
    rail.scrollLeft = 0;
  };

  const shuffleInPlace = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  rails.forEach((rail) => {
    const section = rail.dataset.section;
    const all = Array.isArray(data[section]) ? data[section] : [];
    const imageItems = all.filter((it) => it.image);
    const placeholders = all.filter((it) => !it.image);

    renderRail(rail, imageItems, placeholders);

    const sectionEl = rail.closest('.photo-section');
    const heading = sectionEl?.querySelector('.rail-heading');
    if (!sectionEl || !heading || sectionEl.querySelector('.rail-header')) return;

    const headerRow = document.createElement('div');
    headerRow.className = 'rail-header';
    heading.before(headerRow);
    headerRow.appendChild(heading);

    if (imageItems.length < 2) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'shuffle-btn';
    btn.setAttribute('aria-label', `Shuffle ${heading.textContent.trim()}`);
    btn.title = 'Shuffle';
    const icon = document.createElement('img');
    icon.src = 'images/shuffle.png';
    icon.alt = '';
    icon.width = 18;
    icon.height = 18;
    icon.decoding = 'async';
    btn.appendChild(icon);
    btn.addEventListener('click', () => {
      shuffleInPlace(imageItems);
      renderRail(rail, imageItems, placeholders);
      syncTouchCaptionState();
    });
    headerRow.appendChild(btn);
  });

  const touchCaptions = window.matchMedia('(hover: none), (pointer: coarse)');
  const clearCaptions = (exceptTile) => {
    document.querySelectorAll('.photo-rail .tile.is-caption-visible').forEach((tile) => {
      if (tile !== exceptTile) {
        tile.classList.remove('is-caption-visible');
        tile.setAttribute('aria-expanded', 'false');
      }
    });
  };

  const syncTouchCaptionState = () => {
    document.querySelectorAll('.photo-rail .tile.has-caption').forEach((tile) => {
      if (touchCaptions.matches) {
        tile.tabIndex = 0;
        tile.setAttribute('role', 'button');
        tile.setAttribute('aria-expanded', tile.classList.contains('is-caption-visible') ? 'true' : 'false');
      } else {
        tile.removeAttribute('tabindex');
        tile.removeAttribute('role');
        tile.removeAttribute('aria-expanded');
        tile.classList.remove('is-caption-visible');
      }
    });
  };

  syncTouchCaptionState();
  touchCaptions.addEventListener?.('change', syncTouchCaptionState);

  document.addEventListener('click', (event) => {
    if (!touchCaptions.matches) return;

    const tile = event.target.closest('.photo-rail .tile.has-caption');
    if (!tile) {
      clearCaptions();
      return;
    }

    const shouldShow = !tile.classList.contains('is-caption-visible');
    clearCaptions(tile);
    tile.classList.toggle('is-caption-visible', shouldShow);
    tile.setAttribute('aria-expanded', shouldShow ? 'true' : 'false');
  });

  document.addEventListener('keydown', (event) => {
    if (!touchCaptions.matches || !['Enter', ' '].includes(event.key)) return;

    const tile = event.target.closest('.photo-rail .tile.has-caption');
    if (!tile) return;

    event.preventDefault();
    tile.click();
  });
})();
