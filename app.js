const form = document.getElementById('analysis-form');
const loadExampleBtn = document.getElementById('loadExampleBtn');
const scoreCard = document.getElementById('scoreCard');
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
  highPlatform: document.getElementById('highPlatform'),
  highContentType: document.getElementById('highContentType'),
  highPostingTime: document.getElementById('highPostingTime'),
  highHookScore: document.getElementById('highHookScore'),
  highCtaScore: document.getElementById('highCtaScore'),
  highEngagement: document.getElementById('highEngagement'),
  highReach: document.getElementById('highReach'),
  highSaves: document.getElementById('highSaves'),
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
  if (percent >= 75) {
    return 'major';
  }
  if (percent >= 25) {
    return 'moderate';
  }
  return 'small';
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

function analyze(payload) {
  const engagementLift = safeLift(payload.low.engagement, payload.high.engagement);
  const reachLift = safeLift(payload.low.reach, payload.high.reach);
  const saveLift = safeLift(payload.low.saves, payload.high.saves);
  const hookDelta = payload.high.hookScore - payload.low.hookScore;
  const ctaDelta = payload.high.ctaScore - payload.low.ctaScore;

  const conclusions = [];

  if (payload.low.contentType !== payload.high.contentType) {
    conclusions.push(
      `The ${payload.high.contentType.toLowerCase()} format likely outperformed the ${payload.low.contentType.toLowerCase()} format by creating more scroll-stopping depth and interaction opportunities.`
    );
  }

  if (payload.low.postingTime !== payload.high.postingTime) {
    conclusions.push(
      `Posting at ${payload.high.postingTime.toLowerCase()} appears to align better with audience activity than ${payload.low.postingTime.toLowerCase()}.`
    );
  }

  if (hookDelta >= 2) {
    conclusions.push(
      `A stronger opening hook (${payload.high.hookScore}/10 vs ${payload.low.hookScore}/10) is strongly correlated with higher engagement and longer attention.`
    );
  }

  if (ctaDelta >= 2) {
    conclusions.push(
      `CTA clarity improved materially (${payload.high.ctaScore}/10 vs ${payload.low.ctaScore}/10), which likely increased deliberate actions such as saves and shares.`
    );
  }

  if (!conclusions.length) {
    conclusions.push('Performance differences are mostly explained by metric execution quality rather than obvious content-format changes.');
  }

  const recommendationList = [
    `Double down on ${payload.high.contentType.toLowerCase()} posts and test two hook variants each week.`,
    `Use the high-performing posting window (${payload.high.postingTime}) for key campaign content.`,
    'Create a stronger CTA pattern: one clear action verb + one explicit audience benefit.',
  ];

  if (classifyLift(engagementLift) === 'major') {
    recommendationList.push('Repurpose the high-performing post into a short video and carousel sequence to capture compounding engagement.');
  }

  return {
    engagementLift,
    reachLift,
    saveLift,
    conclusions,
    recommendationList,
  };
}

function liftClass(value) {
  return value >= 0 ? 'metric-up' : 'metric-warn';
}

function render(result) {
  scoreCard.innerHTML = `
    <strong>Performance delta</strong>
    <div class="${liftClass(result.engagementLift)}">Engagement lift: ${result.engagementLift.toFixed(1)}%</div>
    <div class="${liftClass(result.reachLift)}">Reach lift: ${result.reachLift.toFixed(1)}%</div>
    <div class="${liftClass(result.saveLift)}">Saves/Shares lift: ${result.saveLift.toFixed(1)}%</div>
  `;

  insights.innerHTML = `
    <strong>Why high-performing posts won</strong>
    <ul>${result.conclusions.map((item) => `<li>${item}</li>`).join('')}</ul>
  `;

  recommendations.innerHTML = `
    <strong>What to do next</strong>
    <ul>${result.recommendationList.map((item) => `<li>${item}</li>`).join('')}</ul>
  `;
}

function loadExampleData() {
  Object.entries(exampleData).forEach(([key, value]) => {
    fields[key].value = value;
  });

  const result = analyze(getPayload());
  render(result);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = analyze(getPayload());
  render(result);
});

loadExampleBtn.addEventListener('click', loadExampleData);

scoreCard.innerHTML = '<div class="empty-state">Submit post data to calculate performance lift.</div>';
insights.innerHTML = '<div class="empty-state">Conclusions will appear here after analysis.</div>';
recommendations.innerHTML = '<div class="empty-state">Actionable recommendations will appear here.</div>';

loadExampleData();
