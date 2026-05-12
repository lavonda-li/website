(function fadeHeaderIntoWorkSection() {
  const header = document.querySelector('.site-header');
  const workSection = document.querySelector('#work');
  const isHomePage = document.body.dataset.theme === 'light';

  if (!header || !workSection || !isHomePage) return;

  const lavender = [184, 176, 234];
  const white = [255, 255, 255];

  const clamp = (value) => Math.min(1, Math.max(0, value));
  const mix = (from, to, progress) =>
    from.map((channel, index) => Math.round(channel + (to[index] - channel) * progress));

  const updateHeaderBackground = () => {
    const workTop = workSection.getBoundingClientRect().top + window.scrollY;
    const fadeStart = workTop - window.innerHeight * 0.55;
    const fadeEnd = workTop - header.offsetHeight;
    const progress = clamp((window.scrollY - fadeStart) / Math.max(1, fadeEnd - fadeStart));
    const [r, g, b] = mix(lavender, white, progress);

    header.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  };

  updateHeaderBackground();
  window.addEventListener('scroll', updateHeaderBackground, { passive: true });
  window.addEventListener('resize', updateHeaderBackground);

  document.querySelectorAll('a[href="#work"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetTop = workSection.getBoundingClientRect().top + window.scrollY;

      window.history.pushState(null, '', '#work');
      window.scrollTo({
        top: targetTop - header.offsetHeight,
        behavior: 'smooth',
      });
    });
  });

  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  });
})();
