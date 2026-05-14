(async function loadWorkSections() {
  const mounts = document.querySelectorAll('[data-work-sections]');
  if (mounts.length === 0) return;

  let data;
  try {
    const res = await fetch('work.json', { cache: 'no-store' });
    data = await res.json();
  } catch (err) {
    console.error('Failed to load work.json:', err);
    return;
  }

  // "images/<dir>/<name>.<ext>" → "images/<dir>/thumbs/<name>.webp".
  const thumbWebp = (src) => {
    const dot = src.lastIndexOf('.');
    const slash = src.lastIndexOf('/');
    if (dot < 0 || slash < 0 || dot < slash) return src;
    return `${src.slice(0, slash)}/thumbs/${src.slice(slash + 1, dot)}.webp`;
  };

  const sections = Array.isArray(data.sections) ? data.sections : [];

  mounts.forEach((mount) => {
    mount.replaceChildren(
      ...sections.map((item, index) => {
        const section = document.createElement('article');
        section.className = index % 2 === 0 ? 'work-entry' : 'work-entry is-reversed';

        const media = document.createElement('div');
        media.className = 'work-media';
        const collage = document.createElement('div');
        collage.className = 'work-collage';
        const images = Array.isArray(item.images) ? item.images : [];
        collage.replaceChildren(
          ...Array.from({ length: 4 }, (_, imageIndex) => {
            const tile = document.createElement('div');
            tile.className = 'work-tile';
            const image = images[imageIndex];
            if (image?.src) {
              const img = document.createElement('img');
              img.src = thumbWebp(image.src);
              img.alt = image.alt || '';
              img.loading = 'lazy';
              img.decoding = 'async';
              img.fetchPriority = 'low';
              img.width = 720;
              img.height = 720;
              img.onerror = () => {
                if (img.dataset.fallback || img.src === image.src) {
                  img.remove();
                  return;
                }
                img.dataset.fallback = '1';
                img.src = image.src;
              };
              tile.appendChild(img);
            }
            return tile;
          })
        );
        media.appendChild(collage);

        const copy = document.createElement('div');
        copy.className = 'work-copy';
        const label = document.createElement('p');
        label.className = 'work-label';
        label.innerHTML = item.labelHtml || '';

        const paragraphs = Array.isArray(item.paragraphs) ? item.paragraphs : [];
        copy.replaceChildren(
          label,
          ...paragraphs.map((text) => {
            const p = document.createElement('p');
            p.innerHTML = text;
            return p;
          })
        );

        section.append(media, copy);
        return section;
      })
    );
  });
})();
