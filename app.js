const form = document.getElementById('analysis-form');
const loadExampleBtn = document.getElementById('loadExampleBtn');
const scoreCard = document.getElementById('scoreCard');
const visualInsights = document.getElementById('visualInsights');
const insights = document.getElementById('insights');
const recommendations = document.getElementById('recommendations');

const fields = {
  lowPlatform: document.getElementById('lowPlatform'),
  lowContentType: document.getElementById('lowContentType'),
  lowPostingTime: document.getElementById('lowPostingTime'),
  lowHookScore: document.getElementById('lowHookScore'),
  lowCtaScore: document.getElementById('lowCtaScore'),
  lowEngagement: document.getElementById('lowEngagement'),
  lowReach: document.getElementById('lowReach'),
  lowSaves: document.getElementById('lowSaves'),
  lowImage: document.getElementById('lowImage'),
  lowImagePreview: document.getElementById('lowImagePreview'),
  highPlatform: document.getElementById('highPlatform'),
  highContentType: document.getElementById('highContentType'),
  highPostingTime: document.getElementById('highPostingTime'),
  highHookScore: document.getElementById('highHookScore'),
  highCtaScore: document.getElementById('highCtaScore'),
  highEngagement: document.getElementById('highEngagement'),
  highReach: document.getElementById('highReach'),
  highSaves: document.getElementById('highSaves'),
  highImage: document.getElementById('highImage'),
  highImagePreview: document.getElementById('highImagePreview'),
};

const exampleData = {
  lowPlatform: 'Instagram',
  lowContentType: 'Image',
  lowPostingTime: 'Tuesday morning',
  lowHookScore: 4,
  lowCtaScore: 3,
  lowEngagement: 1.2,
  lowReach: 3200,
  lowSaves: 18,
  highPlatform: 'Instagram',
  highContentType: 'Carousel',
  highPostingTime: 'Thursday evening',
  highHookScore: 8,
  highCtaScore: 8,
  highEngagement: 4.8,
  highReach: 14900,
  highSaves: 264,
};

function toNumber(input) {
  return Number.parseFloat(input) || 0;
}

function safeLift(low, high) {
  if (low === 0 && high > 0) {
    return 100;
  }
  if (low === 0) {
    return 0;
  }
  return ((high - low) / low) * 100;
}

function classifyLift(percent) {
  if (percent >= 75) return 'major';
  if (percent >= 25) return 'moderate';
  return 'small';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getPayload() {
  return {
    low: {
      platform: fields.lowPlatform.value.trim(),
      contentType: fields.lowContentType.value,
      postingTime: fields.lowPostingTime.value.trim(),
      hookScore: toNumber(fields.lowHookScore.value),
      ctaScore: toNumber(fields.lowCtaScore.value),
      engagement: toNumber(fields.lowEngagement.value),
      reach: toNumber(fields.lowReach.value),
      saves: toNumber(fields.lowSaves.value),
    },
    high: {
      platform: fields.highPlatform.value.trim(),
      contentType: fields.highContentType.value,
      postingTime: fields.highPostingTime.value.trim(),
      hookScore: toNumber(fields.highHookScore.value),
      ctaScore: toNumber(fields.highCtaScore.value),
      engagement: toNumber(fields.highEngagement.value),
      reach: toNumber(fields.highReach.value),
      saves: toNumber(fields.highSaves.value),
    },
  };
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
  if (!file) {
    return null;
  }

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSide = 240;
  const scale = Math.min(maxSide / img.width, maxSide / img.height, 1);
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let totalBrightness = 0;
  let colorfulness = 0;
  let edgeWeight = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;

    const rg = Math.abs(r - g);
    const yb = Math.abs((r + g) * 0.5 - b);
    colorfulness += rg + yb;

    if (i >= 4) {
      const prevR = data[i - 4];
      const prevG = data[i - 3];
      const prevB = data[i - 2];
      edgeWeight += Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
    }
  }

  const pixels = data.length / 4;
  const avgBrightness = totalBrightness / pixels;
  const avgColorfulness = colorfulness / pixels;
  const edgeDensity = edgeWeight / pixels;

  URL.revokeObjectURL(img.src);

  return {
    brightness: avgBrightness,
    colorfulness: avgColorfulness,
    edgeDensity,
    ratio: canvas.width / canvas.height,
  };
}

function visualSummary(lowVisual, highVisual) {
  if (!lowVisual || !highVisual) {
    return ['Upload both post images to unlock visual AI analysis.'];
  }

  const points = [];

  if (highVisual.brightness - lowVisual.brightness > 12) {
    points.push('The high performer is notably brighter, suggesting clearer focal hierarchy and stronger feed visibility.');
  }

  if (highVisual.colorfulness - lowVisual.colorfulness > 10) {
    points.push('The high performer uses richer color contrast, which likely increased thumb-stop impact.');
  }

  if (highVisual.edgeDensity - lowVisual.edgeDensity > 8) {
    points.push('The high performer has more structural detail/edges, indicating denser visual storytelling.');
  }

  if (Math.abs(highVisual.ratio - lowVisual.ratio) > 0.12) {
    points.push('Aspect ratio differs between creatives; composition format may have influenced platform distribution and attention.');
  }

  if (!points.length) {
    points.push('Visual signatures are similar; copy quality, offer clarity, and timing likely drove most of the gap.');
  }

  return points;
}

function analyze(payload, visuals) {
  const engagementLift = safeLift(payload.low.engagement, payload.high.engagement);
  const reachLift = safeLift(payload.low.reach, payload.high.reach);
  const saveLift = safeLift(payload.low.saves, payload.high.saves);
  const hookDelta = payload.high.hookScore - payload.low.hookScore;
  const ctaDelta = payload.high.ctaScore - payload.low.ctaScore;

  const signalScore = [engagementLift, reachLift, saveLift].reduce((sum, value) => sum + Math.max(0, value), 0) / 3;
  const confidence = signalScore > 160 ? 'High confidence' : signalScore > 60 ? 'Medium confidence' : 'Low confidence';

  const conclusions = [];

  if (payload.low.platform && payload.high.platform && payload.low.platform !== payload.high.platform) {
    conclusions.push(`Different platforms (${payload.low.platform} vs ${payload.high.platform}) likely contributed to part of the gap.`);
  }

  if (payload.low.contentType !== payload.high.contentType) {
    conclusions.push(
      `${payload.high.contentType} appears to outperform ${payload.low.contentType.toLowerCase()} in this sample via stronger interaction potential.`
    );
  }

  if (payload.low.postingTime !== payload.high.postingTime) {
    conclusions.push(`The ${payload.high.postingTime.toLowerCase()} slot likely aligned better with audience activity than ${payload.low.postingTime.toLowerCase()}.`);
  }

  if (hookDelta >= 2) {
    conclusions.push(`Hook quality rose from ${payload.low.hookScore}/10 to ${payload.high.hookScore}/10, likely improving scroll-stop and initial attention.`);
  }

  if (ctaDelta >= 2) {
    conclusions.push(`CTA clarity improved from ${payload.low.ctaScore}/10 to ${payload.high.ctaScore}/10, likely lifting saves/shares intent.`);
  }

  if (!conclusions.length) {
    conclusions.push('No major qualitative differences were detected, so execution consistency should be tested across more posts.');
  }

  const recommendationList = [
    `Prioritize ${payload.high.contentType.toLowerCase()} formats in your next 2-week content sprint.`,
    `Keep posting in the ${payload.high.postingTime} window for priority campaigns.`,
    'Adopt a reusable hook framework: pain point + promised outcome + proof cue.',
    'Use one clear CTA and benchmark saves/shares as your intent KPI.',
  ];

  if (classifyLift(engagementLift) === 'major') {
    recommendationList.push('Turn the winning concept into a creative family (carousel, short video, story) for compounding reach.');
  }

  return {
    engagementLift,
    reachLift,
    saveLift,
    confidence,
    visualPoints: visualSummary(visuals.low, visuals.high),
    conclusions,
    recommendationList,
  };
}

function liftClass(value) {
  return value >= 0 ? 'metric-up' : 'metric-warn';
}

function renderMetric(label, value) {
  return `<article class="metric-tile ${liftClass(value)}"><h3>${escapeHtml(label)}</h3><p>${value.toFixed(1)}%</p></article>`;
}

function render(result) {
  scoreCard.innerHTML = `
    <div class="score-header">
      <strong>Performance delta</strong>
      <span class="confidence-pill">${escapeHtml(result.confidence)}</span>
    </div>
    <div class="metric-grid">
      ${renderMetric('Engagement lift', result.engagementLift)}
      ${renderMetric('Reach lift', result.reachLift)}
      ${renderMetric('Saves/Shares lift', result.saveLift)}
    </div>
  `;

  visualInsights.innerHTML = `
    <strong>Visual AI signals</strong>
    <ul>${result.visualPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  `;

  insights.innerHTML = `
    <strong>Why the high-performing post won</strong>
    <ul>${result.conclusions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  `;

  recommendations.innerHTML = `
    <strong>What to do next</strong>
    <ul>${result.recommendationList.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  `;
}

function setPreview(file, target) {
  if (!file) {
    target.removeAttribute('src');
    target.classList.remove('is-visible');
    return;
  }

  const url = URL.createObjectURL(file);
  target.src = url;
  target.classList.add('is-visible');
  target.onload = () => URL.revokeObjectURL(url);
}

async function runAnalysis() {
  const payload = getPayload();
  const visuals = {
    low: await analyzeImage(fields.lowImage.files[0]),
    high: await analyzeImage(fields.highImage.files[0]),
  };

  render(analyze(payload, visuals));
}

function loadExampleData() {
  Object.entries(exampleData).forEach(([key, value]) => {
    fields[key].value = value;
  });

  runAnalysis();
}

fields.lowImage.addEventListener('change', () => {
  setPreview(fields.lowImage.files[0], fields.lowImagePreview);
  runAnalysis();
});

fields.highImage.addEventListener('change', () => {
  setPreview(fields.highImage.files[0], fields.highImagePreview);
  runAnalysis();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await runAnalysis();
});

loadExampleBtn.addEventListener('click', loadExampleData);

scoreCard.innerHTML = '<div class="empty-state">Submit post data to calculate performance lift.</div>';
visualInsights.innerHTML = '<div class="empty-state">Upload post creatives to generate visual intelligence.</div>';
insights.innerHTML = '<div class="empty-state">Conclusions will appear here after analysis.</div>';
recommendations.innerHTML = '<div class="empty-state">Actionable recommendations will appear here.</div>';

loadExampleData();
