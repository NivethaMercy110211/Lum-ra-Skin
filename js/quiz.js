/**
 * Luméra Skin — Skin Quiz JavaScript
 * Interactive 5-question skin type quiz with result recommendations
 */

'use strict';

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'How does your skin feel about 30 minutes after cleansing?',
    options: [
      { value: 'dry',   label: 'Tight and dry',          icon: 'bi-droplet-half' },
      { value: 'oily',  label: 'Shiny and oily',          icon: 'bi-brightness-high' },
      { value: 'combo', label: 'Oily in the T-zone only', icon: 'bi-layout-split' },
      { value: 'normal',label: 'Comfortable and balanced', icon: 'bi-check-circle' },
    ]
  },
  {
    id: 'q2',
    question: 'Do you notice excess shine throughout the day?',
    options: [
      { value: 'dry',   label: 'Rarely — my skin stays matte',    icon: 'bi-moon-stars' },
      { value: 'oily',  label: 'Yes, across most of my face',      icon: 'bi-sun' },
      { value: 'combo', label: 'Only on my forehead, nose or chin', icon: 'bi-brightness-alt-high' },
      { value: 'normal',label: 'Occasionally, but nothing excessive', icon: 'bi-cloud-sun' },
    ]
  },
  {
    id: 'q3',
    question: 'Does your skin feel tight, rough or flaky?',
    options: [
      { value: 'dry',   label: 'Yes, often — especially in cool weather', icon: 'bi-wind' },
      { value: 'oily',  label: 'No, my skin tends to feel supple',         icon: 'bi-droplet-fill' },
      { value: 'combo', label: 'In patches, mainly on cheeks or around eyes', icon: 'bi-patch-question' },
      { value: 'normal',label: 'Occasionally — mostly seasonal',           icon: 'bi-calendar3' },
    ]
  },
  {
    id: 'q4',
    question: 'Are breakouts or blemishes a regular concern for you?',
    options: [
      { value: 'dry',    label: 'Rarely — my skin is usually clear',    icon: 'bi-shield-check' },
      { value: 'oily',   label: 'Yes, I experience breakouts frequently', icon: 'bi-exclamation-circle' },
      { value: 'combo',  label: 'Occasionally, mainly in the T-zone',    icon: 'bi-dash-circle' },
      { value: 'sensitive', label: 'Sometimes, often with redness too',  icon: 'bi-heart-pulse' },
    ]
  },
  {
    id: 'q5',
    question: 'How would you describe your skin\'s sensitivity?',
    options: [
      { value: 'sensitive', label: 'Very sensitive — reacts to many products', icon: 'bi-thermometer-high' },
      { value: 'oily',      label: 'Not very sensitive — most products work fine', icon: 'bi-shield' },
      { value: 'dry',       label: 'Sensitive to harsh ingredients and weather', icon: 'bi-cloud-drizzle' },
      { value: 'normal',    label: 'Generally tolerates most products well',    icon: 'bi-hand-thumbs-up' },
    ]
  }
];

const RESULTS = {
  dry: {
    type: 'Dry Skin',
    description: 'Your skin may benefit from deeply hydrating ingredients that support the skin barrier and lock in moisture. A gentle, nourishing routine may help maintain comfort and suppleness.',
    products: ['Gentle Hydrating Cleanser', 'Ceramide Barrier Cream', 'Hyaluronic Acid Serum', 'Nourishing Face Oil'],
    link: 'skin-type-guide.html#dry'
  },
  oily: {
    type: 'Oily Skin',
    description: 'Your skin may benefit from lightweight, non-comedogenic formulas designed to support balanced sebum levels without stripping the skin barrier.',
    products: ['Balancing Gel Cleanser', 'Niacinamide Serum', 'Oil-Free Moisturiser', 'BHA Exfoliant'],
    link: 'skin-type-guide.html#oily'
  },
  combo: {
    type: 'Combination Skin',
    description: 'Your skin shows characteristics of multiple skin types. A balanced routine that addresses both dryness and excess shine in different zones may work well for you.',
    products: ['Gentle Foaming Cleanser', 'Balancing Toner', 'Lightweight Moisturiser', 'Targeted Serum'],
    link: 'skin-type-guide.html#combination'
  },
  normal: {
    type: 'Normal Skin',
    description: 'Your skin appears well-balanced with few concerns. A consistent routine focused on maintenance and prevention may help preserve your skin\'s natural equilibrium.',
    products: ['Mild Cleanser', 'Hydrating Toner', 'Everyday Moisturiser', 'Vitamin C Serum'],
    link: 'skin-type-guide.html#normal'
  },
  sensitive: {
    type: 'Sensitive Skin',
    description: 'Your skin may benefit from fragrance-free, minimally formulated products with soothing ingredients. Patch testing new products is always recommended.',
    products: ['Ultra-Gentle Cleanser', 'Centella Soothing Serum', 'Barrier Repair Cream', 'Mineral SPF'],
    link: 'skin-type-guide.html#sensitive'
  }
};

class SkinQuiz {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.answers = {};
    this.currentQ = 0;
    this.render();
  }

  tally() {
    const counts = { dry: 0, oily: 0, combo: 0, normal: 0, sensitive: 0 };
    Object.values(this.answers).forEach(v => { if (counts[v] !== undefined) counts[v]++; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  render() {
    this.renderQuestion(this.currentQ);
  }

  renderQuestion(idx) {
    const q = QUIZ_QUESTIONS[idx];
    const progress = ((idx) / QUIZ_QUESTIONS.length) * 100;

    this.container.innerHTML = `
      <div class="quiz-card fade-up visible">
        <div class="quiz-progress">
          <div class="quiz-progress-steps">
            ${QUIZ_QUESTIONS.map((_, i) => `<div class="quiz-step ${i < idx ? 'done' : ''} ${i === idx ? 'active' : ''}"></div>`).join('')}
          </div>
          <div class="quiz-progress-bar" role="progressbar" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100">
            <div class="quiz-progress-fill" style="width:${progress}%"></div>
          </div>
          <p class="quiz-count">Question ${idx + 1} of ${QUIZ_QUESTIONS.length}</p>
        </div>
        <h4 class="quiz-question">${q.question}</h4>
        <div class="quiz-options" role="group" aria-label="Answer options">
          ${q.options.map(opt => `
            <button class="quiz-option ${this.answers[q.id] === opt.value ? 'selected' : ''}" 
                    data-value="${opt.value}" 
                    data-qid="${q.id}"
                    type="button">
              <i class="bi ${opt.icon} quiz-option-icon"></i>
              <span>${opt.label}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-navigation">
          ${idx > 0 ? `<button class="btn-outline-brand quiz-prev" type="button"><i class="bi bi-arrow-left"></i> Back</button>` : '<span></span>'}
          ${this.answers[q.id] !== undefined
            ? (idx < QUIZ_QUESTIONS.length - 1
                ? `<button class="btn-primary-brand quiz-next" type="button">Next <i class="bi bi-arrow-right"></i></button>`
                : `<button class="btn-primary-brand quiz-submit" type="button">Find My Routine <i class="bi bi-sparkles"></i></button>`
              )
            : ''}
        </div>
      </div>
    `;

    // Bind events
    this.container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        this.answers[btn.dataset.qid] = btn.dataset.value;
        this.renderQuestion(this.currentQ);
      });
    });

    this.container.querySelector('.quiz-prev')?.addEventListener('click', () => {
      this.currentQ = Math.max(0, this.currentQ - 1);
      this.renderQuestion(this.currentQ);
    });
    this.container.querySelector('.quiz-next')?.addEventListener('click', () => {
      this.currentQ = Math.min(QUIZ_QUESTIONS.length - 1, this.currentQ + 1);
      this.renderQuestion(this.currentQ);
    });
    this.container.querySelector('.quiz-submit')?.addEventListener('click', () => {
      this.showResult();
    });
  }

  showResult() {
    const type = this.tally();
    const result = RESULTS[type];
    this.container.innerHTML = `
      <div class="quiz-card quiz-result fade-up visible">
        <div class="quiz-result-badge"><i class="bi bi-patch-check-fill"></i></div>
        <span class="section-label">Your Skin Profile</span>
        <h3>${result.type}</h3>
        <p>${result.description}</p>
        <div class="quiz-result-products">
          <p class="quiz-result-subtitle">Suggested product types for you:</p>
          <ul class="quiz-result-list">
            ${result.products.map(p => `<li><i class="bi bi-check-circle-fill text-primary-brand"></i> ${p}</li>`).join('')}
          </ul>
        </div>
        <div class="quiz-result-actions">
          <a href="shop.html" class="btn-primary-brand">Shop for ${result.type} <i class="bi bi-arrow-right"></i></a>
          <a href="${result.link}" class="btn-outline-brand">Read ${result.type} Guide</a>
        </div>
        <button class="quiz-restart" type="button">Retake Quiz</button>
      </div>
    `;
    this.container.querySelector('.quiz-restart')?.addEventListener('click', () => {
      this.answers = {};
      this.currentQ = 0;
      this.render();
    });
  }
}

// ---- Init on DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
  // Full quiz page
  if (document.getElementById('skinQuizFull')) {
    window._skinQuiz = new SkinQuiz('skinQuizFull');
  }
  // Teaser (home page) — runs same quiz
  if (document.getElementById('skinQuizTeaser')) {
    window._skinQuizTeaser = new SkinQuiz('skinQuizTeaser');
  }
});
