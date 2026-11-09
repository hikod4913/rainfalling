'use strict';

(() => {
  const desktopPointer = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const handheld = navigator.userAgentData?.mobile ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  if (handheld) return;

  const root = document.documentElement;
  const main = document.querySelector('main');
  let cursor, glow, trail, frame = 0;

  function paint() {
    frame = 0;
    for (const axis of ['x', 'y']) {
      glow[axis] += (cursor[axis] - glow[axis]) * .25;
      trail[axis] += (cursor[axis] - trail[axis]) * .10;
      root.style.setProperty('--ambient-' + axis, glow[axis] + 'px');
      root.style.setProperty('--ambient-tail-' + axis, trail[axis] + 'px');
    }
    if (Math.hypot(cursor.x - trail.x, cursor.y - trail.y) > .5) {
      frame = requestAnimationFrame(paint);
    }
  }

  function follow(event) {
    if (event.pointerType !== 'mouse') {
      clear();
      return;
    }
    cursor = {x: event.clientX, y: event.clientY};
    if (!glow) {
      glow = {...cursor};
      trail = {...cursor};
    }
    root.classList.add('ambient-following');
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    glow = null;
    root.classList.remove('ambient-following');
  }

  function sync() {
    root.classList.toggle('ambient-desktop', desktopPointer.matches);
    if (desktopPointer.matches) {
      main.addEventListener('pointermove', follow, {passive: true});
      main.addEventListener('pointerleave', clear);
      window.addEventListener('blur', clear);
    } else {
      main.removeEventListener('pointermove', follow);
      main.removeEventListener('pointerleave', clear);
      window.removeEventListener('blur', clear);
      clear();
    }
  }

  desktopPointer.addEventListener('change', sync);
  sync();
})();
