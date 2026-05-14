(function fadeHeaderAcrossHomepageSections() {
  const header = document.querySelector('.site-header');
  const workSection = document.querySelector('#work');
  const lifeSection = document.querySelector('#life');
  const brandImage = header?.querySelector('.brand img');
  const isHomePage = document.body.dataset.theme === 'light';
  const navLinks = {
    home: header?.querySelector('.nav a[href="#top"]'),
    work: header?.querySelector('.nav a[href="#work"]'),
    life: header?.querySelector('.nav a[href="#life"]'),
  };

  if (!header || !workSection || !isHomePage) return;

  const lavender = [184, 176, 234];
  const white = [255, 255, 255];
  const black = [0, 0, 0];

  const clamp = (value) => Math.min(1, Math.max(0, value));
  const mix = (from, to, progress) =>
    from.map((channel, index) => Math.round(channel + (to[index] - channel) * progress));

  const progressToward = (section) => {
    if (!section) return 0;

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const fadeStart = sectionTop - window.innerHeight * 0.55;
    const fadeEnd = sectionTop - header.offsetHeight;

    return clamp((window.scrollY - fadeStart) / Math.max(1, fadeEnd - fadeStart));
  };

  const setActiveNav = () => {
    const activeKey = lifeSection && progressToward(lifeSection) > 0.98
      ? 'life'
      : progressToward(workSection) > 0.98
        ? 'work'
        : 'home';

    Object.entries(navLinks).forEach(([key, link]) => {
      link?.classList.toggle('active', key === activeKey);
    });
  };

  const updateHeaderBackground = () => {
    const workProgress = progressToward(workSection);
    const lifeProgress = progressToward(lifeSection);
    const workColor = mix(lavender, white, workProgress);
    const [r, g, b] = mix(workColor, black, lifeProgress);
    const [textR, textG, textB] = mix(black, white, lifeProgress);

    header.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    header.style.color = `rgb(${textR}, ${textG}, ${textB})`;

    if (brandImage) {
      brandImage.style.filter = `invert(${lifeProgress})`;
    }

    setActiveNav();
  };

  updateHeaderBackground();
  window.addEventListener('scroll', updateHeaderBackground, { passive: true });
  window.addEventListener('resize', updateHeaderBackground);

  const scrollToSection = (section, hash, behavior = 'smooth') => {
    const targetTop = section.getBoundingClientRect().top + window.scrollY;

    if (hash) {
      window.history.pushState(null, '', hash);
    }

    window.scrollTo({
      top: targetTop - header.offsetHeight,
      behavior,
    });
  };

  document.querySelectorAll('a[href="#work"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToSection(workSection, '#work');
    });
  });

  document.querySelectorAll('a[href="#life"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!lifeSection) return;

      event.preventDefault();
      scrollToSection(lifeSection, '#life');
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

  window.addEventListener('load', () => {
    const sectionForHash = {
      '#work': workSection,
      '#life': lifeSection,
    }[window.location.hash];

    if (!sectionForHash) return;

    requestAnimationFrame(() => scrollToSection(sectionForHash, null, 'auto'));
    window.setTimeout(() => scrollToSection(sectionForHash, null, 'auto'), 300);
  });
})();
