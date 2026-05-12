(function revealImagesOnScroll() {
  const main = document.querySelector('main');
  if (!main) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window && !reduceMotion;

  let observer;
  if (canObserve) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12,
      }
    );
  }

  const watchImage = (img) => {
    if (img.dataset.revealBound === 'true') return;
    img.dataset.revealBound = 'true';

    if (img.closest('.home-hero')) return;

    img.classList.add('reveal-image');

    if (!canObserve) {
      img.classList.add('is-visible');
      return;
    }

    observer.observe(img);
  };

  main.querySelectorAll('img').forEach(watchImage);

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches('img')) watchImage(node);
        node.querySelectorAll?.('img').forEach(watchImage);
      });
    });
  });

  mutationObserver.observe(main, { childList: true, subtree: true });
})();
