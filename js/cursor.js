(function enableGoldenCursorTrail() {
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduceMotion) return;

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let lastTrailX = pointerX;
  let lastTrailY = pointerY;
  let lastTrailAt = 0;

  const makeSprinkle = (x, y) => {
    const sprinkle = document.createElement('span');
    const size = 2 + Math.random() * 4;
    const driftX = 8 + Math.random() * 18;
    const driftY = -8 + Math.random() * 18;

    sprinkle.className = 'star-sprinkle';
    sprinkle.setAttribute('aria-hidden', 'true');
    sprinkle.style.setProperty('--sprinkle-size', `${size}px`);
    sprinkle.style.setProperty('--sprinkle-x', `${x + (Math.random() - 0.5) * 8}px`);
    sprinkle.style.setProperty('--sprinkle-y', `${y + (Math.random() - 0.5) * 8}px`);
    sprinkle.style.setProperty('--sprinkle-drift-x', `${driftX}px`);
    sprinkle.style.setProperty('--sprinkle-drift-y', `${driftY}px`);

    document.body.appendChild(sprinkle);
    sprinkle.addEventListener('animationend', () => sprinkle.remove(), { once: true });
  };

  const handlePointerMove = (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    const now = performance.now();
    const distance = Math.hypot(pointerX - lastTrailX, pointerY - lastTrailY);
    if (distance < 10 || now - lastTrailAt < 24) return;

    makeSprinkle(pointerX - 10, pointerY + 2);
    if (distance > 28) makeSprinkle(pointerX - 20, pointerY + 6);

    lastTrailX = pointerX;
    lastTrailY = pointerY;
    lastTrailAt = now;
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
})();
