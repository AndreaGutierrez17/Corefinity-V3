document.addEventListener('DOMContentLoaded', () => {
  initMegaMenuPreview();
  initTrustedSlider();
  initCarousels();
  initCasesSlider();
  initVideoThumbControls();
});

function initMegaMenuPreview() {
  const resourceItems = document.querySelectorAll('.resource-item');
  const preview = document.getElementById('resourcePreview');

  if (!preview || !resourceItems.length) return;

  const previewTitle = preview.querySelector('.cf-preview-title');
  const previewText = preview.querySelector('.cf-preview-text');
  const previewLink = document.getElementById('previewLink');
  const defaultImage = preview.dataset.defaultImage || '';
  const desktopOnly = window.matchMedia('(min-width: 992px)');

  const applyDefault = () => {
    if (!desktopOnly.matches) {
      preview.style.backgroundImage = '';
      preview.classList.add('cf-preview-static');
      return;
    }
    preview.classList.remove('cf-preview-static');
    if (defaultImage) {
      preview.style.backgroundImage = `url('${defaultImage}')`;
    }
  };

  const handleHover = (item) => {
    if (!desktopOnly.matches) return;

    const title = item.dataset.title || '';
    const desc = item.dataset.desc || '';
    const img = item.dataset.image || '';
    const href = item.getAttribute('href') || '#';

    if (title) previewTitle.textContent = title;
    if (desc) previewText.textContent = desc;
    if (img) preview.style.backgroundImage = `url('${img}')`;
    if (previewLink) previewLink.setAttribute('href', href);
  };

  resourceItems.forEach((item) => {
    item.addEventListener('mouseenter', () => handleHover(item));
    item.addEventListener('focus', () => handleHover(item));
  });

  applyDefault();
  desktopOnly.addEventListener('change', applyDefault);
}

function initTrustedSlider() {
  const track = document.getElementById('trustedTrack');
  const btnLeft = document.querySelector('.cf-trusted-arrow.left');
  const btnRight = document.querySelector('.cf-trusted-arrow.right');

  if (!track) return;

  const baseLogo = track.querySelector('img');
  const STEP = baseLogo ? baseLogo.getBoundingClientRect().width + 30 : 220;
  const INTERVAL = 3500;
  let direction = 1;

  function slide(dir) {
    const maxScroll = track.scrollWidth - track.clientWidth;
    let next = track.scrollLeft + dir * STEP;

    if (next <= 0) {
      next = 0;
      direction = 1;
    }
    if (next >= maxScroll) {
      next = maxScroll;
      direction = -1;
    }

    track.scrollTo({
      left: next,
      behavior: 'smooth'
    });
  }

  btnLeft && btnLeft.addEventListener('click', () => slide(-1));
  btnRight && btnRight.addEventListener('click', () => slide(1));

  setInterval(() => {
    slide(direction);
  }, INTERVAL);
}

function initCarousels() {
  const carousels = document.querySelectorAll('.cf-carousel, .cf-testimonial-carousel');

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('.cf-carousel-track');
    const slides = Array.from(track?.children || []);
    const btnPrev = carousel.querySelector('.cf-carousel-arrow.left');
    const btnNext = carousel.querySelector('.cf-carousel-arrow.right');

    if (!track || !slides.length) return;

    let index = 0;

    const getGap = () => {
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0');
      return Number.isNaN(gap) ? 0 : gap;
    };

    const getSlideWidth = () => {
      const first = slides[0];
      return first ? first.getBoundingClientRect().width : carousel.clientWidth;
    };

    const update = () => {
      const offset = index * (getSlideWidth() + getGap());
      track.style.transform = `translateX(-${offset}px)`;

      slides.forEach((slide, idx) => {
        const vid = slide.querySelector('video');
        if (vid && idx !== index) vid.pause();
      });

      const thumbsWrapper = carousel.parentElement?.querySelector('.cf-video-thumbs');
      if (thumbsWrapper) {
        thumbsWrapper.querySelectorAll('.cf-video-thumb').forEach((thumb, idx) => {
          thumb.classList.toggle('active', idx === index);
        });
      }
    };

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      update();
    };

    btnPrev && btnPrev.addEventListener('click', () => goTo(index - 1));
    btnNext && btnNext.addEventListener('click', () => goTo(index + 1));

    window.addEventListener('resize', update);

    carousel.cfGoTo = goTo;
    update();
  });
}

function initCasesSlider() {
  const viewport = document.querySelector('.cf-cases-viewport');
  const track = document.querySelector('.cf-cases-track');
  const cards = document.querySelectorAll('.cf-case-card');
  const btnPrev = document.querySelector('.cf-cases-arrow.left');
  const btnNext = document.querySelector('.cf-cases-arrow.right');

  if (!viewport || !track || cards.length === 0) return;

  let currentIndex = 0;
  let cardsPerView = window.innerWidth < 992 ? 1 : 2;

  const updateCardsPerView = () => {
    cardsPerView = window.innerWidth < 992 ? 1 : 2;
  };

  const maxIndex = () => Math.max(0, Math.ceil(cards.length / cardsPerView) - 1);

  const updateSlider = () => {
    const viewportWidth = viewport.clientWidth;
    track.style.transform = `translateX(-${currentIndex * viewportWidth}px)`;
  };

  const goTo = (dir) => {
    currentIndex += dir;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex()) currentIndex = maxIndex();
    updateSlider();
  };

  btnPrev && btnPrev.addEventListener('click', () => goTo(-1));
  btnNext && btnNext.addEventListener('click', () => goTo(1));

  window.addEventListener('resize', () => {
    const prevCardsPerView = cardsPerView;
    updateCardsPerView();
    if (prevCardsPerView !== cardsPerView && currentIndex > maxIndex()) {
      currentIndex = maxIndex();
    }
    updateSlider();
  });

  updateCardsPerView();
  updateSlider();
}

function initVideoThumbControls() {
  const videoSection = document.querySelector('#client-testimonials');
  if (!videoSection) return;

  const carousel = videoSection.querySelector('.cf-carousel');
  const thumbs = videoSection.querySelectorAll('.cf-video-thumb');

  thumbs.forEach((thumb) => {
    const idx = parseInt(thumb.getAttribute('data-video-index'), 10);
    thumb.addEventListener('click', () => {
      if (carousel && typeof carousel.cfGoTo === 'function') {
        carousel.cfGoTo(idx);
      }
    });
  });
}
