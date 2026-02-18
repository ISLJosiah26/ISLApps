const postCardsRoot = document.getElementById('postCards');
const postCardTemplate = document.getElementById('postCardTemplate');
const addPostBtn = document.getElementById('addPostBtn');
const loadExampleBtn = document.getElementById('loadExampleBtn');
const analyzeBtn = document.getElementById('analyzeBtn');

const scoreCard = document.getElementById('scoreCard');
const conversation = document.getElementById('conversation');
const comparison = document.getElementById('comparison');
const recommendations = document.getElementById('recommendations');

const HOOK_WORDS = ['how', 'why', 'secret', 'mistake', 'stop', 'before', 'now', 'guide', 'boost', 'proven'];
const CTA_WORDS = ['comment', 'save', 'share', 'dm', 'click', 'follow', 'join', 'apply', 'learn more', 'tag'];

function toNumber(value) {
  return Number.parseFloat(value) || 0;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function sentenceCase(value) {
  if (!value) return 'unspecified';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function pickCardElements(card) {
  return {
    imageInput: card.querySelector('[data-field="image"]'),
    preview: card.querySelector('[data-preview]'),
    caption: card.querySelector('[data-field="caption"]'),
    platform: card.querySelector('[data-field="platform"]'),
    postType: card.querySelector('[data-field="postType"]'),
    likes: card.querySelector('[data-field="likes"]'),
    comments: card.querySelector('[data-field="comments"]'),
    impressions: card.querySelector('[data-field="impressions"]'),
    engagements: card.querySelector('[data-field="engagements"]'),
    postDate: card.querySelector('[data-field="postDate"]'),
    postTime: card.querySelector('[data-field="postTime"]'),
    removeBtn: card.querySelector('[data-remove]'),
    number: card.querySelector('[data-post-number]'),
  };
}

function updateCardNumbers() {
  [...postCardsRoot.querySelectorAll('[data-card]')].forEach((card, index) => {
    const numberEl = card.querySelector('[data-post-number]');
    numberEl.textContent = `${index + 1}`;
  });
}

function setPreview(file, previewEl) {
  if (!file) {
    previewEl.removeAttribute('src');
    previewEl.classList.remove('is-visible');
    return;
  }

  const url = URL.createObjectURL(file);
  previewEl.src = url;
  previewEl.classList.add('is-visible');
  previewEl.onload = () => URL.revokeObjectURL(url);
}

function createCard(initialData = {}) {
  const fragment = postCardTemplate.content.cloneNode(true);
  const card = fragment.querySelector('[data-card]');
  const el = pickCardElements(card);

  el.caption.value = initialData.caption ?? '';
  el.platform.value = initialData.platform ?? '';
  el.postType.value = initialData.postType ?? '';
  el.likes.value = initialData.likes ?? 0;
  el.comments.value = initialData.comments ?? 0;
  el.impressions.value = initialData.impressions ?? 0;
  el.engagements.value = initialData.engagements ?? 0;
  el.postDate.value = initialData.postDate ?? '';
  el.postTime.value = initialData.postTime ?? '';

  el.imageInput.addEventListener('change', () => {
    setPreview(el.imageInput.files[0], el.preview);
  });

  el.removeBtn.addEventListener('click', () => {
    card.remove();
    updateCardNumbers();
    renderEmptyIfNeeded();
  });

  postCardsRoot.append(card);
  updateCardNumbers();
}

function getCardsPayload() {
  return [...postCardsRoot.querySelectorAll('[data-card]')].map((card, index) => {
    const el = pickCardElements(card);
    return {
      id: index + 1,
      caption: el.caption.value.trim(),
      platform: el.platform.value.trim(),
      postType: el.postType.value,
      likes: toNumber(el.likes.value),
      comments: toNumber(el.comments.value),
      impressions: toNumber(el.impressions.value),
      engagements: toNumber(el.engagements.value),
      postDate: el.postDate.value,
      postTime: el.postTime.value,
      imageFile: el.imageInput.files[0] ?? null,
    };
  });
}

function scoreHookQuality(caption) {
  const text = caption.toLowerCase();
  const lengthScore = caption.length > 140 ? 2 : caption.length > 70 ? 1.5 : 1;
  const questionScore = text.includes('?') ? 2 : 0;
  const numberScore = /\d/.test(text) ? 1.2 : 0;
  const keywordScore = HOOK_WORDS.reduce((sum, word) => (text.includes(word) ? sum + 0.7 : sum), 0);
  const emojiScore = /[\u{1F300}-\u{1FAFF}]/u.test(text) ? 0.8 : 0;

  return Math.min(10, Math.max(1, Math.round((lengthScore + questionScore + numberScore + keywordScore + emojiScore) * 10) / 10));
}

function scoreCtaStrength(caption) {
  const text = caption.toLowerCase();
  const ctaHits = CTA_WORDS.reduce((sum, word) => (text.includes(word) ? sum + 1 : sum), 0);
  const exclamationBoost = text.includes('!') ? 0.6 : 0;
  const directAddressBoost = text.includes('you') || text.includes('your') ? 0.6 : 0;

  const score = 1 + ctaHits * 1.4 + exclamationBoost + directAddressBoost;
  return Math.min(10, Math.round(score * 10) / 10);
}

function detectDayPart(timeString) {
  if (!timeString) return 'unknown time';
  const hour = Number.parseInt(timeString.split(':')[0], 10);
  if (Number.isNaN(hour)) return 'unknown time';
  if (hour < 6) return 'late night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function analyzeImage(file) {
  if (!file) return null;

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSide = 220;
  const scale = Math.min(maxSide / img.width, maxSide / img.height, 1);
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let brightnessTotal = 0;
  let colorfulnessTotal = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    brightnessTotal += (r + g + b) / 3;
    colorfulnessTotal += Math.abs(r - g) + Math.abs((r + g) / 2 - b);
  }

  const pixels = data.length / 4;
  URL.revokeObjectURL(img.src);

  return {
    brightness: brightnessTotal / pixels,
    colorfulness: colorfulnessTotal / pixels,
    aspectRatio: canvas.width / canvas.height,
  };
}

async function enrichPosts(rawPosts) {
  const visuals = await Promise.all(rawPosts.map((post) => analyzeImage(post.imageFile)));

  return rawPosts.map((post, index) => {
    const hookQuality = scoreHookQuality(post.caption);
    const ctaStrength = scoreCtaStrength(post.caption);
    const engagementRate = post.impressions > 0 ? (post.engagements / post.impressions) * 100 : 0;
    const interactionRate = post.impressions > 0 ? ((post.likes + post.comments) / post.impressions) * 100 : 0;

    const performanceScore = engagementRate * 0.55 + interactionRate * 0.25 + hookQuality * 1.3 + ctaStrength * 1.2;

    return {
      ...post,
      hookQuality,
      ctaStrength,
      engagementRate,
      interactionRate,
      performanceScore,
      dayPart: detectDayPart(post.postTime),
      visual: visuals[index],
    };
  });
}

function summarizeVisualDifference(topPost, bottomPost) {
  if (!topPost.visual || !bottomPost.visual) {
    return 'I could not compare both visuals yet. Upload images for each post and I’ll analyze brightness, color depth, and composition style too.';
  }

  const notes = [];

  if (topPost.visual.brightness - bottomPost.visual.brightness > 10) {
    notes.push('the winning creative is brighter, which typically improves feed-level scannability');
  }
  if (topPost.visual.colorfulness - bottomPost.visual.colorfulness > 8) {
    notes.push('its color contrast appears stronger, which can increase thumb-stop rate');
  }
  if (Math.abs(topPost.visual.aspectRatio - bottomPost.visual.aspectRatio) > 0.12) {
    notes.push('it uses a different composition ratio, which may have impacted platform presentation');
  }

  if (!notes.length) {
    return 'Visually, both posts are pretty similar, so copy clarity and timing likely drove the bigger performance differences.';
  }

  return `From a visual standpoint, ${notes.join(', ')}.`;
}

function renderMetrics(posts) {
  const ranked = [...posts].sort((a, b) => b.performanceScore - a.performanceScore);
  const leader = ranked[0];

  scoreCard.innerHTML = `
    <div class="score-header">
      <strong>Top performer: Post ${leader.id}</strong>
      <span class="confidence-pill">Compared ${posts.length} posts</span>
    </div>
    <div class="metric-grid">
      ${ranked
        .slice(0, 3)
        .map(
          (post) => `<article class="metric-tile metric-up">
            <h3>Post ${post.id}</h3>
            <p>${post.performanceScore.toFixed(1)}</p>
            <small>Engagement rate ${formatPercent(post.engagementRate)}</small>
          </article>`
        )
        .join('')}
    </div>
  `;
}

function renderConversation(posts) {
  const ranked = [...posts].sort((a, b) => b.performanceScore - a.performanceScore);
  const winner = ranked[0];
  const lowest = ranked[ranked.length - 1];

  const message = `
    <p><strong>Here’s the quick read:</strong> Post ${winner.id} is your strongest performer right now. It has a ${formatPercent(
      winner.engagementRate
    )} engagement rate, with an AI-estimated hook score of ${winner.hookQuality}/10 and CTA strength of ${winner.ctaStrength}/10.</p>
    <p>Compared with Post ${lowest.id}, the biggest lift appears to come from better caption structure and clearer action language. ${summarizeVisualDifference(
      winner,
      lowest
    )}</p>
    <p>If you want, keep using this winning caption pattern on ${sentenceCase(winner.platform || 'your platform')} ${winner.postType || 'posts'} during the ${
    winner.dayPart
  } window.</p>
  `;

  conversation.innerHTML = `<strong>Conversational AI summary</strong>${message}`;
}

function renderComparison(posts) {
  const rows = posts
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .map(
      (post) => `<li>
        <strong>Post ${post.id}</strong> (${escapeHtml(post.postType || 'Unknown type')}, ${escapeHtml(post.platform || 'Unknown platform')}) — 
        Score ${post.performanceScore.toFixed(1)} | Engagement ${formatPercent(post.engagementRate)} | Hook ${post.hookQuality}/10 | CTA ${post.ctaStrength}/10
      </li>`
    )
    .join('');

  comparison.innerHTML = `<strong>Post-by-post comparison</strong><ul>${rows}</ul>`;
}

function renderRecommendations(posts) {
  const ranked = [...posts].sort((a, b) => b.performanceScore - a.performanceScore);
  const top = ranked[0];

  recommendations.innerHTML = `
    <strong>What I’d do next</strong>
    <ul>
      <li>Clone Post ${top.id}'s opening style and publish 3 variants this week with different first lines.</li>
      <li>Keep CTA wording direct (e.g., “save this”, “comment your take”, “DM for details”) and benchmark uplift.</li>
      <li>Post your priority content in the <strong>${top.dayPart}</strong> time window until new data suggests otherwise.</li>
      <li>Build a simple content scorecard: hook quality, CTA strength, engagement rate, and saves/comments trend over time.</li>
    </ul>
  `;
}

function renderEmptyIfNeeded() {
  const cardsCount = postCardsRoot.querySelectorAll('[data-card]').length;
  if (cardsCount > 0) return;

  scoreCard.innerHTML = '<div class="empty-state">Add at least 2 posts to compare performance.</div>';
  conversation.innerHTML = '<div class="empty-state">Conversational AI analysis will appear here.</div>';
  comparison.innerHTML = '<div class="empty-state">Post-by-post comparison appears here.</div>';
  recommendations.innerHTML = '<div class="empty-state">Actionable recommendations appear here.</div>';
}

async function analyzeAllPosts() {
  const rawPosts = getCardsPayload();

  if (rawPosts.length < 2) {
    scoreCard.innerHTML = '<div class="empty-state">Please add at least 2 posts so I can compare them.</div>';
    return;
  }

  const posts = await enrichPosts(rawPosts);
  renderMetrics(posts);
  renderConversation(posts);
  renderComparison(posts);
  renderRecommendations(posts);
}

function loadExamples() {
  postCardsRoot.innerHTML = '';

  const samplePosts = [
    {
      caption: 'Struggling to hire fast? 3 things we changed this month that boosted applicant quality. Save this checklist.',
      platform: 'Instagram',
      postType: 'Carousel',
      likes: 240,
      comments: 33,
      impressions: 8200,
      engagements: 412,
      postDate: '2026-02-03',
      postTime: '18:35',
    },
    {
      caption: 'We are hiring now. Apply today.',
      platform: 'Instagram',
      postType: 'Image',
      likes: 58,
      comments: 4,
      impressions: 5100,
      engagements: 92,
      postDate: '2026-02-01',
      postTime: '09:10',
    },
    {
      caption: 'Before you post job ads again, stop and fix these 2 mistakes. Comment "guide" and I\'ll DM the template.',
      platform: 'LinkedIn',
      postType: 'Text',
      likes: 134,
      comments: 27,
      impressions: 6400,
      engagements: 286,
      postDate: '2026-02-05',
      postTime: '14:20',
    },
  ];

  samplePosts.forEach((post) => createCard(post));
  analyzeAllPosts();
}

addPostBtn.addEventListener('click', () => createCard());
loadExampleBtn.addEventListener('click', loadExamples);
analyzeBtn.addEventListener('click', analyzeAllPosts);

createCard();
createCard();
renderEmptyIfNeeded();
