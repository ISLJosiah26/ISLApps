const form = document.getElementById('ad-form');
const jobTitleInput = document.getElementById('jobTitle');
const locationInput = document.getElementById('location');
const contactInput = document.getElementById('contactName');
const orientationSelect = document.getElementById('orientationSelect');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('adCanvas');
const ctx = canvas.getContext('2d');

const brand = {
  company: 'INTEGRATED\nSTAFFING',
  website: 'integratedstaffing.ca',
  fontFamily: "'Gotham', 'Avenir Next', 'Montserrat', Arial, sans-serif",
  colours: {
    blue: '#0f63b6',
    white: '#ffffff',
    line: 'rgba(98, 166, 230, 0.36)',
    pill: '#e7e7ea',
    textOnBlue: '#f7f9ff',
    textBlue: '#0f5ea9',
  },
};

const sizes = {
  portrait: { width: 1080, height: 1350 },
  landscape: { width: 1200, height: 628 },
};

function setCanvasSize() {
  const orientation = orientationSelect.value;
  const dimension = sizes[orientation] ?? sizes.portrait;
  canvas.width = dimension.width;
  canvas.height = dimension.height;
}

function wrapText(text, maxWidth, lineHeight, x, y, align = 'left') {
  const words = text.split(' ');
  let line = words[0] ?? '';
  const lines = [];

  for (let i = 1; i < words.length; i += 1) {
    const test = `${line} ${words[i]}`;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      lines.push(line);
      line = words[i];
    }
  }
  lines.push(line);

  ctx.textAlign = align;
  lines.forEach((entry, index) => {
    ctx.fillText(entry, x, y + index * lineHeight);
  });
  return y + (lines.length - 1) * lineHeight;
}

function drawBackground(w, h) {
  ctx.fillStyle = brand.colours.blue;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = brand.colours.line;
  ctx.lineWidth = Math.max(2, w * 0.004);

  for (let i = -2; i < 16; i += 1) {
    ctx.beginPath();
    const waveY = h * (0.18 + i * 0.045);
    ctx.moveTo(-w * 0.2, waveY);
    for (let x = -w * 0.2; x <= w * 1.2; x += 20) {
      const y = waveY + Math.sin((x / w) * Math.PI * 2 + i * 0.3) * (h * 0.06) + ((x - w * 0.5) ** 2 / (w * w)) * (h * 0.2);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawLogo(w, h, orientation) {
  ctx.fillStyle = brand.colours.white;
  ctx.textAlign = 'right';
  ctx.font = `700 ${Math.round(w * (orientation === 'portrait' ? 0.06 : 0.05))}px ${brand.fontFamily}`;
  const anchorX = w * 0.89;
  const topY = h * 0.13;
  ctx.fillText('INTEGRATED', anchorX, topY);
  ctx.font = `700 ${Math.round(w * (orientation === 'portrait' ? 0.036 : 0.03))}px ${brand.fontFamily}`;
  ctx.fillText('STAFFING', anchorX, topY + h * 0.05);

  ctx.lineWidth = 3;
  ctx.strokeStyle = brand.colours.white;
  ctx.beginPath();
  ctx.moveTo(anchorX - w * 0.19, topY - h * 0.01);
  ctx.lineTo(anchorX - w * 0.03, topY - h * 0.01);
  ctx.stroke();
}

function drawPortrait(data) {
  const w = canvas.width;
  const h = canvas.height;
  drawBackground(w, h);
  drawLogo(w, h, 'portrait');

  ctx.fillStyle = brand.colours.textOnBlue;
  ctx.textAlign = 'left';
  ctx.font = `300 ${Math.round(w * 0.052)}px ${brand.fontFamily}`;
  ctx.fillText("WE'RE HIRING!", w * 0.1, h * 0.43);

  ctx.font = `700 ${Math.round(w * 0.058)}px ${brand.fontFamily}`;
  const titleY = wrapText(data.jobTitle.toUpperCase(), w * 0.8, h * 0.063, w * 0.1, h * 0.515);

  ctx.strokeStyle = brand.colours.white;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, titleY + h * 0.04);
  ctx.lineTo(w * 0.9, titleY + h * 0.04);
  ctx.stroke();

  ctx.font = `500 ${Math.round(w * 0.047)}px ${brand.fontFamily}`;
  ctx.fillText(`⚙ Direct-hire`, w * 0.1, titleY + h * 0.095);
  ctx.textAlign = 'right';
  ctx.fillText(`📍 ${data.location}`, w * 0.9, titleY + h * 0.095);

  const pillX = w * 0.1;
  const pillY = h * 0.84;
  const pillW = w * 0.8;
  const pillH = h * 0.08;
  roundRect(pillX, pillY, pillW, pillH, pillH / 2, brand.colours.pill);

  drawContactCircle(pillX + pillH / 2, pillY + pillH / 2, pillH * 0.42);

  ctx.fillStyle = brand.colours.textBlue;
  ctx.textAlign = 'left';
  ctx.font = `500 ${Math.round(w * 0.036)}px ${brand.fontFamily}`;
  wrapText(
    `Apply online today, or connect with ${data.contactName} for more details at: ${brand.website}`,
    pillW - pillH * 1.3,
    h * 0.032,
    pillX + pillH,
    pillY + pillH * 0.38
  );
}

function drawLandscape(data) {
  const w = canvas.width;
  const h = canvas.height;
  drawBackground(w, h);
  drawLogo(w, h, 'landscape');

  ctx.fillStyle = brand.colours.textOnBlue;
  ctx.textAlign = 'left';
  ctx.font = `300 ${Math.round(h * 0.1)}px ${brand.fontFamily}`;
  ctx.fillText("WE'RE HIRING!", w * 0.06, h * 0.23);

  ctx.font = `700 ${Math.round(h * 0.1)}px ${brand.fontFamily}`;
  const titleY = wrapText(data.jobTitle.toUpperCase(), w * 0.46, h * 0.11, w * 0.06, h * 0.38);

  ctx.strokeStyle = brand.colours.white;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.06, titleY + h * 0.05);
  ctx.lineTo(w * 0.52, titleY + h * 0.05);
  ctx.stroke();

  ctx.font = `500 ${Math.round(h * 0.065)}px ${brand.fontFamily}`;
  ctx.fillText(`⚙ Direct-hire`, w * 0.06, titleY + h * 0.13);
  ctx.fillText(`📍 ${data.location}`, w * 0.33, titleY + h * 0.13);

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w * 0.87, h * 0.78, h * 0.45, 0, Math.PI * 2);
  ctx.fill();

  const imageGradient = ctx.createLinearGradient(w * 0.67, h * 0.32, w, h);
  imageGradient.addColorStop(0, '#f8efe9');
  imageGradient.addColorStop(1, '#e57a3e');
  ctx.fillStyle = imageGradient;
  ctx.beginPath();
  ctx.arc(w * 0.87, h * 0.78, h * 0.425, 0, Math.PI * 2);
  ctx.fill();

  const pillX = w * 0.055;
  const pillY = h * 0.81;
  const pillW = w * 0.46;
  const pillH = h * 0.14;
  roundRect(pillX, pillY, pillW, pillH, pillH / 2, brand.colours.pill);

  drawContactCircle(pillX + pillH / 2, pillY + pillH / 2, pillH * 0.38);

  ctx.fillStyle = brand.colours.textBlue;
  ctx.textAlign = 'left';
  ctx.font = `500 ${Math.round(h * 0.055)}px ${brand.fontFamily}`;
  wrapText(
    `Apply online today, or connect with ${data.contactName} at: ${brand.website}`,
    pillW - pillH * 1.4,
    h * 0.056,
    pillX + pillH,
    pillY + pillH * 0.42
  );
}

function roundRect(x, y, width, height, radius, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

function drawContactCircle(cx, cy, radius) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  grad.addColorStop(0, '#7c8b9c');
  grad.addColorStop(1, '#d8b89a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.86, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  setCanvasSize();
  const data = {
    jobTitle: jobTitleInput.value.trim() || 'Job Title',
    location: locationInput.value.trim() || 'Location',
    contactName: contactInput.value.trim() || 'Contact Name',
  };

  if (orientationSelect.value === 'landscape') {
    drawLandscape(data);
  } else {
    drawPortrait(data);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  render();
});

[jobTitleInput, locationInput, contactInput, orientationSelect].forEach((field) => {
  field.addEventListener('input', render);
  field.addEventListener('change', render);
});

downloadBtn.addEventListener('click', () => {
  render();
  const safeTitle = (jobTitleInput.value.trim() || 'job-ad').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const link = document.createElement('a');
  link.download = `${safeTitle}-${orientationSelect.value}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

jobTitleInput.value = 'Inventory & Warehouse Coordinator';
locationInput.value = 'Dartmouth, NS';
contactInput.value = 'Lisa Laviolette';
orientationSelect.value = 'portrait';
render();
