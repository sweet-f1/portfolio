// Example portfolio data
const works = [
  {
    title: 'Soothing Tracker App',
    category: 'UI Design',
    desc: 'A smart iOS interface for tracking and analyzing infant soothing sessions.',
    images: Array.from({length: 5}, (_, i) => `images/app/app1-${i+1}.png`),
    isCarousel: true
  },
  {
    title: 'AgriGuard Dashboard',
    category: 'UI Design',
    desc: 'A field monitoring interface designed for iPadOS, enabling real-time visualization of crop distribution, disease and pest alerts, and the deployment status of inspection robots across the farm.',
    images: Array.from({length: 5}, (_, i) => `images/app/app2-${i+1}.png`),
    isCarousel: true
  },
  {
    title: 'Overwatch Pop-Up Experience',
    category: 'User Experience',
    desc: 'A themed interactive pop-up store designed to engage gamers with immersive scenarios, limited-edition merchandise, and participatory events. This space combines service design, spatial planning, and fan culture to boost brand presence and deepen emotional connection with the community.',
    img: 'images/UX/守望先锋竖版海报.png'
  },
  {
    title: 'Digital Red Cross UX Audit',
    category: 'User Experience',
    desc: 'This study identifies key usability issues—including deep feature nesting, complex system architecture, and accidental exits—and proposes design improvements to enhance accessibility, simplify navigation, and reduce user attrition.',
    img: 'images/UX/ux2.png'
  },
  {
    title: 'Open World Archery Game',
    category: 'Game Design',
    desc: 'An immersive third-person archery adventure set in a richly detailed natural world.',
    img: 'images/game/game1.jpg',
  },
  {
    title: 'RPG Adventure World',
    category: 'Game Design',
    desc: 'A stylized open-world environment designed for an action RPG.',
    images: [
      'images/game/game2-1.png',
      'images/game/game2-2.jpg'
    ],
    isCarousel: true
  },
  {
    title: 'Portfolio 2023',
    category: 'Sketch & Render',
    desc: 'A collection of hand-drawn and 3D rendered works.',
    images: Array.from({length: 10}, (_, i) => `images/portfolio/Portfolio2023-${i+1}.jpg`),
    isCarousel: true
  },
];

const masonry = document.getElementById('portfolio');

function createCard(work) {
  const card = document.createElement('div');
  card.className = 'card';
  if (work.isCarousel) {
    card.innerHTML = `
      <div class="carousel-viewer-container">
        <img class="carousel-image carousel-image-current" src="${work.images[0]}" alt="${work.title} page 1">
        <img class="carousel-image carousel-image-next" style="opacity:0;position:absolute;left:0;top:0;pointer-events:none;" src="${work.images[0]}" alt="" />
      </div>
      <div class="card-content">
        <div class="card-category">${work.category}</div>
        <div class="card-title">${work.title}</div>
        <div class="card-desc">${work.desc}</div>
      </div>
    `;
    let idx = 0;
    let interval = null;
    let firstTimeout = null;
    const container = card.querySelector('.carousel-viewer-container');
    const imgCurrent = card.querySelector('.carousel-image-current');
    const imgNext = card.querySelector('.carousel-image-next');
    // 预加载所有图片，找最大宽高比
    Promise.all(work.images.map(src => new Promise(res => {
      const img = new window.Image();
      img.onload = () => res(img.width / img.height);
      img.src = src;
    }))).then(ratios => {
      // 取最大宽高比
      const maxRatio = Math.max(...ratios);
      container.style.aspectRatio = `${maxRatio}`;
    });
    const showNext = () => {
      const nextIdx = (idx + 1) % work.images.length;
      imgNext.src = work.images[nextIdx];
      imgNext.alt = `${work.title} page ${nextIdx+1}`;
      imgNext.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1)';
      imgNext.style.opacity = 1;
      setTimeout(() => {
        imgCurrent.src = work.images[nextIdx];
        imgCurrent.alt = `${work.title} page ${nextIdx+1}`;
        imgNext.style.transition = 'none';
        imgNext.style.opacity = 0;
        idx = nextIdx;
      }, 500);
    };
    const startCarousel = () => {
      if (interval || firstTimeout) return;
      firstTimeout = setTimeout(() => {
        showNext();
        interval = setInterval(showNext, 1500);
      }, 300);
    };
    const stopCarousel = () => {
      clearTimeout(firstTimeout);
      firstTimeout = null;
      clearInterval(interval);
      interval = null;
    };
    card.addEventListener('mouseenter', startCarousel);
    card.addEventListener('mouseleave', stopCarousel);
  } else {
    card.innerHTML = `
      <img src="${work.img}" alt="${work.title}">
      <div class="card-content">
        <div class="card-category">${work.category}</div>
        <div class="card-title">${work.title}</div>
        <div class="card-desc">${work.desc}</div>
      </div>
    `;
  }

  // Lightbox 预览功能
  card.addEventListener('click', e => {
    // 阻止卡片内链接跳转
    if (e.target.tagName === 'A') return;
    e.stopPropagation();
    showLightbox(work);
  });
  return card;
}

function showLightbox(work) {
  // 支持单图和多图
  const images = work.images ? work.images : [work.img];
  let idx = 0;
  // 创建modal
  const modal = document.createElement('div');
  modal.className = 'lightbox-modal';
  modal.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" title="Close">&times;</button>
      <img class="lightbox-image" src="${images[0]}" alt="${work.title} preview">
    </div>
  `;
  document.body.appendChild(modal);
  const img = modal.querySelector('.lightbox-image');
  const closeBtn = modal.querySelector('.lightbox-close');
  let interval = null;
  // 切换图片
  function showImg(newIdx, animate = true) {
    if (newIdx < 0) newIdx = images.length - 1;
    if (newIdx >= images.length) newIdx = 0;
    if (animate) {
      img.classList.add('hide');
      setTimeout(() => {
        img.src = images[newIdx];
        img.alt = `${work.title} preview ${newIdx+1}`;
        img.onload = () => {
          img.classList.remove('hide');
        };
      }, 250);
    } else {
      img.src = images[newIdx];
      img.alt = `${work.title} preview ${newIdx+1}`;
      img.classList.remove('hide');
    }
    idx = newIdx;
  }
  // 自动轮播（仅多图）
  function startAuto() {
    if (images.length <= 1) return;
    interval = setInterval(() => showImg(idx + 1), 1800);
  }
  function stopAuto() {
    clearInterval(interval);
    interval = null;
  }
  // 事件绑定
  closeBtn.onclick = () => { stopAuto(); modal.remove(); };
  modal.onclick = e => { if (e.target === modal) { stopAuto(); modal.remove(); } };
  img.onmouseenter = stopAuto;
  img.onmouseleave = startAuto;
  // 键盘关闭
  document.addEventListener('keydown', function escHandler(ev) {
    if (ev.key === 'Escape') { stopAuto(); modal.remove(); document.removeEventListener('keydown', escHandler); }
  });
  // 启动
  showImg(0, false);
  startAuto();
}

function renderWorks(filter) {
  masonry.innerHTML = '';
  works.filter(w => !filter || w.category === filter).forEach(work => {
    masonry.appendChild(createCard(work));
  });
}

// Navigation filter
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const hash = link.getAttribute('href');
    let filter = '';
    if (hash === '#all') filter = '';
    else if (hash === '#ui-design') filter = 'UI Design';
    else if (hash === '#ux') filter = 'User Experience';
    else if (hash === '#game-design') filter = 'Game Design';
    else if (hash === '#sketch-render') filter = 'Sketch & Render';
    renderWorks(filter);
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Initial render
renderWorks(); 