(() => {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.slider-dot')];
  const label = document.querySelector('.slider-label');
  const hero = document.querySelector('.hero-slider');

  if (!slides.length || !dots.length || !label || !hero) return;

  let current = 0;
  let timer;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
    });

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    label.textContent = slides[current].dataset.area;
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 8000);
  }

  document.querySelector('.slider-prev')?.addEventListener('click', () => {
    show(current - 1);
    restart();
  });

  document.querySelector('.slider-next')?.addEventListener('click', () => {
    show(current + 1);
    restart();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      restart();
    });
  });

  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', restart);
  hero.addEventListener('focusin', () => clearInterval(timer));
  hero.addEventListener('focusout', restart);

  restart();
})();
