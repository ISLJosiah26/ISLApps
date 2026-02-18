const postCardsRoot = document.getElementById('postCards');
const postCardTemplate = document.getElementById('postCardTemplate');
const addPostBtn = document.getElementById('addPostBtn');
const loadExampleBtn = document.getElementById('loadExampleBtn');
const analyzeBtn = document.getElementById('analyzeBtn');

const scoreCard = document.getElementById('scoreCard');
const conversation = document.getElementById('conversation');
const comparison = document.getElementById('comparison');
const recommendations = document.getElementById('recommendations');

const HOOK_WORDS = ['how', 'why', 'secret', 'mistake', 'stop', 'before', 'now', 'guide', 'boost', 'proven', 'truth', 'framework'];
const CTA_WORDS = ['comment', 'save', 'share', 'dm', 'click', 'follow', 'join', 'apply', 'learn more', 'tag', 'download', 'reply'];
const POWER_TONES = ['imagine', 'instantly', 'unlock', 'breakthrough', 'insider', 'simple'];

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
    fileName: card.querySelector('[data-file-name]'),
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
  };
}

function updateCardNumbers() {
  [...postCardsRoot.querySelectorAll('[data-card]')].forEach((card, index) => {
    const numberEl = card.querySelector('[data-post-number]');
    numberEl.textContent = `${index + 1}`;
  });
}

function setPreview(file, previewEl, fileNameEl) {
  if (!file) {
    previewEl.removeAttribute('src');
    previewEl.classList.remove('is-visible');
    fileNameEl.textContent = 'No file selected';
    return;
  }

  const url = URL.createObjectURL(file);
  previewEl.src = url;
  previewEl.classList.add('is-visible');
  fileNameEl.textContent = file.name;
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
    setPreview(el.imageInput.files[0], el.preview, el.fileName);
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

function countWordHits(text, words) {
  return words.reduce((sum, word) => (text.includes(word) ? sum + 1 : sum), 0);
}

function scoreHookQuality(caption) {
  const text = caption.toLowerCase();
  const questionScore = text.includes('?') ? 1.8 : 0;
  const numberScore = /\d/.test(text) ? 1.1 : 0;
  const keywordScore = countWordHits(text, HOOK_WORDS) * 0.65;
  const toneScore = countWordHits(text, POWER_TONES) * 0.4;
  const lengthSweetSpot = caption.length >= 80 && caption.length <= 220 ? 1.5 : 0.8;
  const patternBreak = /(^|\s)(you|your|we|imagine|what if)(\s|,|\?)/.test(text) ? 0.8 : 0;

  const raw = lengthSweetSpot + questionScore + numberScore + keywordScore + toneScore + patternBreak;
  return Math.min(10, Math.max(1, Math.round(raw * 10) / 10));
}

function scoreCtaStrength(caption) {
  const text = caption.toLowerCase();
  const ctaHits = countWordHits(text, CTA_WORDS);
  const directiveBoost = /(do this|try this|save this|comment below|dm me|tap)/.test(text) ? 1 : 0;
  const urgencyBoost = /(today|now|this week|don’t miss|limited)/.test(text) ? 0.7 : 0;
  const clarityBoost = /(for|to get|to learn|so you can)/.test(text) ? 0.6 : 0;

  const score = 1.2 + ctaHits * 1.2 + directiveBoost + urgencyBoost + clarityBoost;
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
    const commentsToLikes = post.likes > 0 ? post.comments / post.likes : 0;

    const performanceScore = engagementRate * 0.5 + interactionRate * 0.25 + hookQuality * 1.4 + ctaStrength * 1.35;

    return {
      ...post,
      hookQuality,
      ctaStrength,
      engagementRate,
      interactionRate,
      commentsToLikes,
      performanceScore,
      dayPart: detectDayPart(post.postTime),
      visual: visuals[index],
    };
  });
}

function summarizeVisualDifference(topPost, bottomPost) {
  if (!topPost.visual || !bottomPost.visual) {
    return 'I can already compare copy and performance trends, and if you upload images for each post I can also critique visual style shifts.';
  }

  const notes = [];

  if (topPost.visual.brightness - bottomPost.visual.brightness > 10) {
    notes.push('the winner is visibly brighter, which usually reads cleaner in the first 0.5 seconds of feed scanning');
  }
  if (topPost.visual.colorfulness - bottomPost.visual.colorfulness > 8) {
    notes.push('its color contrast is more assertive, likely giving it stronger thumb-stop energy');
  }
  if (Math.abs(topPost.visual.aspectRatio - bottomPost.visual.aspectRatio) > 0.12) {
    notes.push('it uses a different framing ratio, which can materially change composition and on-platform presentation');
  }

  if (!notes.length) {
    return 'Creatively, the visuals are in a similar family, so your biggest lift came from copy direction and timing rather than design alone.';
  }

  return `Visually, ${notes.join(', ')}.`;
}

function getCreativeCritique(post) {
  const notes = [];

  if (post.hookQuality >= 8.5) {
    notes.push('opens with a high-friction hook that earns attention quickly');
  } else if (post.hookQuality <= 4.5) {
    notes.push('starts softly and likely needs a sharper first-line tension point');
  }

  if (post.ctaStrength >= 8) {
    notes.push('uses clear conversion language that tells the audience exactly what to do next');
  } else if (post.ctaStrength <= 4.5) {
    notes.push('has a passive CTA tone, so intent is probably leaking before action');
  }

  if (post.commentsToLikes > 0.22) {
    notes.push('creates above-average conversation depth, which suggests polarizing or high-relevance messaging');
  }

  if (post.dayPart === 'evening' || post.dayPart === 'afternoon') {
    notes.push(`was published in the ${post.dayPart}, which is often favorable for dwell time`);
  }

  return notes.length ? notes.join('; ') : 'shows balanced performance characteristics without one dominant creative signal.';
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
            <small>Engagement ${formatPercent(post.engagementRate)} · Hook ${post.hookQuality}/10 · CTA ${post.ctaStrength}/10</small>
          </article>`
        )
        .join('')}
    </div>
  `;
}

function renderConversation(posts) {
  const ranked = [...posts].sort((a, b) => b.performanceScore - a.performanceScore);
  const winner = ranked[0];
  const runnerUp = ranked[1];
  const lowest = ranked[ranked.length - 1];
  const spread = winner.performanceScore - lowest.performanceScore;

  const message = `
    <p><strong>Quick diagnosis:</strong> Post ${winner.id} is leading with a ${formatPercent(
      winner.engagementRate
    )} engagement rate and the strongest creative signature in this set.</p>
    <p>The gap versus Post ${lowest.id} is <strong>${spread.toFixed(1)} score points</strong>. In plain terms, the winner combines better hook architecture, clearer action language, and stronger audience response momentum.</p>
    <p><strong>Creative read on Post ${winner.id}:</strong> ${escapeHtml(getCreativeCritique(winner))}.</p>
    <p><strong>Compared with Post ${runnerUp.id}:</strong> your top two are close, but Post ${winner.id} edges ahead because its conversion language is sharper and the interaction profile is healthier.</p>
    <p>${escapeHtml(summarizeVisualDifference(winner, lowest))}</p>
  `;

  conversation.innerHTML = `<strong>Conversational AI summary</strong>${message}`;
}

function renderComparison(posts) {
  const rows = [...posts]
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .map(
      (post) => `<li>
        <strong>Post ${post.id}</strong> (${escapeHtml(post.postType || 'Unknown type')}, ${escapeHtml(post.platform || 'Unknown platform')}) —
        Score ${post.performanceScore.toFixed(1)} | Engagement ${formatPercent(post.engagementRate)} | Hook ${post.hookQuality}/10 | CTA ${post.ctaStrength}/10
        <br /><span class="row-critique">Critique: ${escapeHtml(getCreativeCritique(post))}.</span>
      </li>`
    )
    .join('');

  comparison.innerHTML = `<strong>Post-by-post creative comparison</strong><ul>${rows}</ul>`;
}

function renderRecommendations(posts) {
  const ranked = [...posts].sort((a, b) => b.performanceScore - a.performanceScore);
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];

  recommendations.innerHTML = `
    <strong>What I’d do next</strong>
    <ul>
      <li>Build a 3-post mini-series from Post ${top.id}'s opening style. Keep the same promise angle, but vary proof format (stat, story, checklist).</li>
      <li>Rewrite Post ${bottom.id} with a contrast-based first line ("Most people do X. Here’s why that fails.") and one explicit CTA in the final sentence.</li>
      <li>A/B test two CTA endings this week: one community CTA ("comment") vs one retention CTA ("save this").</li>
      <li>For the next cycle, track comments-to-likes ratio as a quality signal, not just total engagements.</li>
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
      caption: 'Most hiring posts fail because they open with role details instead of emotional tension. Here are 3 fixes. Save this and try one today.',
      platform: 'Instagram',
      postType: 'Carousel',
      likes: 286,
      comments: 41,
      impressions: 8600,
      engagements: 470,
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
      caption: 'Before you post another ad, stop. Comment "guide" and I will DM the exact structure that doubled applicant quality for us.',
      platform: 'LinkedIn',
      postType: 'Text',
      likes: 154,
      comments: 31,
      impressions: 6400,
      engagements: 302,
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
