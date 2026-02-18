const { useState, useRef, useCallback } = React;

const PLATFORMS = ['LinkedIn', 'Instagram', 'Facebook'];
const PLATFORM_META = {
  LinkedIn: { emoji: '💼', color: '#0A84FF', glow: 'rgba(10,132,255,0.3)' },
  Instagram: { emoji: '📸', color: '#FF375F', glow: 'rgba(255,55,95,0.3)' },
  Facebook: { emoji: '👥', color: '#0A84FF', glow: 'rgba(10,132,255,0.25)' },
};
const POST_TYPES = {
  LinkedIn: ['Text Only', 'Image', 'Carousel', 'Video', 'Article', 'Poll', 'Document'],
  Instagram: ['Photo', 'Carousel', 'Reel', 'Story', 'Video'],
  Facebook: ['Text Only', 'Photo', 'Video', 'Link', 'Reel', 'Story', 'Event'],
};

let uid = 0;
const newPost = (platform = 'LinkedIn') => ({
  id: ++uid,
  platform,
  postType: POST_TYPES[platform][0],
  caption: '',
  impressions: '',
  engagements: '',
  comments: '',
  shares: '',
  timePosted: '',
  audience: '',
  imageBase64: null,
  imageMediaType: null,
  imagePreview: null,
});

const engRate = (p) => {
  const imp = Number(p.impressions) || 0;
  const eng = Number(p.engagements) || 0;
  if (!imp || !eng) return null;
  return ((eng / imp) * 100).toFixed(2);
};

const appleFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif";

const G = {
  pageBg: '#0A0A0F',
  glassCard: 'rgba(255,255,255,0.065)',
  glassInput: 'rgba(255,255,255,0.07)',
  borderHair: 'rgba(255,255,255,0.10)',
  borderMid: 'rgba(255,255,255,0.14)',
  separator: 'rgba(255,255,255,0.07)',
  textPrimary: 'rgba(255,255,255,0.92)',
  textSecondary: 'rgba(255,255,255,0.60)',
  textTertiary: 'rgba(255,255,255,0.38)',
  textQuaternary: 'rgba(255,255,255,0.22)',
  blue: '#0A84FF',
  blueGlow: 'rgba(10,132,255,0.4)',
  blueSoft: 'rgba(10,132,255,0.15)',
  blueMid: 'rgba(10,132,255,0.25)',
  green: '#32D74B',
  greenGlow: 'rgba(50,215,75,0.35)',
  greenSoft: 'rgba(50,215,75,0.12)',
  red: '#FF453A',
  redSoft: 'rgba(255,69,58,0.12)',
  orange: '#FF9F0A',
  orangeSoft: 'rgba(255,159,10,0.12)',
  purple: '#BF5AF2',
  teal: '#5AC8FA',
};

const inputBase = {
  width: '100%',
  background: G.glassInput,
  border: `1px solid ${G.borderHair}`,
  borderRadius: 12,
  padding: '11px 14px',
  color: G.textPrimary,
  fontSize: 15,
  fontFamily: appleFont,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.2s',
  WebkitAppearance: 'none',
  backdropFilter: 'blur(10px)',
};

const selectBase = {
  ...inputBase,
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 13px center',
  paddingRight: 38,
  cursor: 'pointer',
};

const textareaBase = {
  ...inputBase,
  resize: 'vertical',
  minHeight: 100,
  lineHeight: 1.55,
};

function GlassCard({ children, style = {}, glow }) {
  return (
    <div
      style={{
        background: G.glassCard,
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: `1px solid ${G.borderHair}`,
        borderRadius: 20,
        boxShadow: glow
          ? `0 0 0 1px ${G.borderHair}, 0 8px 32px rgba(0,0,0,0.4), 0 0 60px ${glow}`
          : `0 0 0 1px ${G.borderHair}, 0 8px 32px rgba(0,0,0,0.4)`,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: G.textTertiary,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        margin: '28px 0 10px 2px',
        fontFamily: appleFont,
      }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children, color }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: color || G.textTertiary,
        letterSpacing: '0.02em',
        marginBottom: 7,
        fontFamily: appleFont,
      }}
    >
      {children}
    </div>
  );
}

function MetricField({ label, value, onChange, placeholder, accentColor }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FieldLabel color={focused ? accentColor : undefined}>{label}</FieldLabel>
      <input
        type="number"
        min="0"
        style={{
          ...inputBase,
          borderColor: focused ? accentColor : G.borderHair,
          boxShadow: focused
            ? `0 0 0 3px ${accentColor}25, inset 0 1px 0 rgba(255,255,255,0.05)`
            : 'inset 0 1px 0 rgba(255,255,255,0.03)',
          background: focused ? `${accentColor}0D` : G.glassInput,
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function GlassInput({ value, onChange, placeholder, multiline }) {
  const [focused, setFocused] = useState(false);
  const style = {
    ...(multiline ? textareaBase : inputBase),
    borderColor: focused ? G.borderMid : G.borderHair,
    boxShadow: focused ? `0 0 0 3px ${G.blueSoft}` : 'inset 0 1px 0 rgba(255,255,255,0.03)',
    background: focused ? 'rgba(255,255,255,0.09)' : G.glassInput,
  };
  return multiline ? (
    <textarea
      style={style}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  ) : (
    <input
      style={style}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function GlassSelect({ value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      style={{
        ...selectBase,
        borderColor: focused ? G.borderMid : G.borderHair,
        boxShadow: focused ? `0 0 0 3px ${G.blueSoft}` : 'none',
        background: focused ? 'rgba(255,255,255,0.10)' : G.glassInput,
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {options.map((o) => (
        <option key={o} value={o} style={{ background: '#1C1C1E', color: '#fff' }}>
          {o}
        </option>
      ))}
    </select>
  );
}

function EngagementRateBar({ post }) {
  const rate = engRate(post);
  if (rate === null) {
    return (
      <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: `1px dashed ${G.borderHair}` }}>
        <span style={{ fontSize: 12, color: G.textQuaternary, fontFamily: appleFont }}>Enter impressions & engagements to see rate</span>
      </div>
    );
  }
  const r = Number.parseFloat(rate);
  const pct = Math.min((r / 10) * 100, 100);
  const { color, label, glow } =
    r >= 5
      ? { color: G.green, label: 'Excellent', glow: G.greenGlow }
      : r >= 3
      ? { color: '#32D74B', label: 'Good', glow: 'rgba(50,215,75,0.2)' }
      : r >= 1
      ? { color: G.orange, label: 'Average', glow: 'rgba(255,159,10,0.2)' }
      : { color: G.red, label: 'Low', glow: 'rgba(255,69,58,0.2)' };

  return (
    <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: `1px solid ${G.borderHair}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: G.textTertiary, fontFamily: appleFont, fontWeight: 500 }}>Engagement Rate</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}18`, padding: '2px 8px', borderRadius: 20, border: `1px solid ${color}30` }}>{label}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: appleFont }}>{rate}%</span>
        </div>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            borderRadius: 99,
            boxShadow: `0 0 8px ${glow}`,
            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>
    </div>
  );
}

function ImageDropzone({ imagePreview, onUpload, onRemove }) {
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onUpload({ base64: e.target.result.split(',')[1], mediaType: file.type, preview: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  return (
    <div>
      <FieldLabel>Visual Post — AI will analyze it (optional)</FieldLabel>
      {imagePreview ? (
        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: `1px solid ${G.borderMid}` }}>
          <img src={imagePreview} alt="Post" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
          <button
            onClick={onRemove}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 30,
              height: 30,
              borderRadius: 99,
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid rgba(255,255,255,0.2)`,
              color: 'rgba(255,255,255,0.9)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          style={{
            border: `1.5px dashed ${dragging ? G.blue : G.borderMid}`,
            borderRadius: 14,
            padding: '24px 20px',
            background: dragging ? G.blueSoft : 'rgba(255,255,255,0.03)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 26, marginBottom: 6 }}>🖼️</div>
          <div style={{ fontSize: 14, color: dragging ? G.blue : G.textSecondary, fontWeight: 600, fontFamily: appleFont }}>Upload Post Image</div>
          <div style={{ fontSize: 12, color: G.textTertiary, marginTop: 3, fontFamily: appleFont }}>Drag & drop or click · JPG, PNG, WebP</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}

function TierChip({ tier }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: tier === 'high' ? G.greenSoft : G.redSoft, color: tier === 'high' ? G.green : G.red, border: `1px solid ${tier === 'high' ? 'rgba(50,215,75,0.3)' : 'rgba(255,69,58,0.3)'}`, fontFamily: appleFont }}>
      {tier === 'high' ? '↑ High' : '↓ Low'}
    </span>
  );
}

function ImpactBadge({ impact }) {
  const map = {
    high: { color: G.blue, bg: G.blueSoft, border: G.blueMid },
    medium: { color: G.orange, bg: G.orangeSoft, border: 'rgba(255,159,10,0.25)' },
    low: { color: G.textTertiary, bg: 'rgba(255,255,255,0.05)', border: G.borderHair },
  };
  const s = map[impact] || map.low;
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontFamily: appleFont }}>{impact}</span>;
}

function App() {
  const [posts, setPosts] = useState([newPost('LinkedIn'), newPost('Instagram'), newPost('Facebook')]);
  const [tab, setTab] = useState('input');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const update = (id, field, value) =>
    setPosts((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, [field]: value };
        if (field === 'platform') next.postType = POST_TYPES[value][0];
        return next;
      })
    );

  const setImage = (id, data) =>
    setPosts((ps) =>
      ps.map((p) =>
        p.id !== id
          ? p
          : {
              ...p,
              imageBase64: data?.base64 || null,
              imageMediaType: data?.mediaType || null,
              imagePreview: data?.preview || null,
            }
      )
    );

  const canAnalyze = posts.length >= 2 && posts.every((p) => p.caption.trim());

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    const postsData = posts.map((p, i) => ({
      index: i + 1,
      platform: p.platform,
      postType: p.postType,
      caption: p.caption,
      audience: p.audience || 'Not specified',
      timePosted: p.timePosted || 'Not specified',
      hasImage: !!p.imageBase64,
      metrics: {
        impressions: Number(p.impressions) || 0,
        engagements: Number(p.engagements) || 0,
        comments: Number(p.comments) || 0,
        shares: Number(p.shares) || 0,
        engagementRate: engRate(p) ? `${engRate(p)}%` : 'Unknown',
      },
    }));

    const userContent = [
      {
        type: 'text',
        text: `You are an expert social media strategist for LinkedIn, Instagram, and Facebook. Analyze these ${posts.length} posts and explain why some performed better than others. Engagement rate = engagements / impressions.

Posts:
${JSON.stringify(postsData, null, 2)}

For posts with uploaded images, analyze visual composition, color palette, text overlays, emotional tone, brand clarity, and alignment with caption.

Respond ONLY with valid JSON:
{"summary":"...","highPerformerTraits":["..."],"lowPerformerTraits":["..."],"keyInsights":[{"title":"...","detail":"...","impact":"high"}],"actionableRecommendations":["..."],"platformBreakdown":[{"platform":"LinkedIn","observation":"..."}],"postRankings":[{"index":1,"tier":"high","reason":"..."}],"visualNotes":[{"index":1,"notes":null}],"topPost":{"index":1,"reason":"..."},"worstPost":{"index":1,"reason":"..."}}`,
      },
    ];

    posts.forEach((p, i) => {
      if (p.imageBase64) {
        userContent.push({ type: 'text', text: `Image for Post #${i + 1} (${p.platform} · ${p.postType}):` });
        userContent.push({ type: 'image', source: { type: 'base64', media_type: p.imageMediaType, data: p.imageBase64 } });
      }
    });

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: userContent }],
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const text = data.content?.map((b) => b.text || '').join('') || '';
      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first === -1 || last === -1) throw new Error('No JSON in response');
      const parsed = JSON.parse(text.slice(first, last + 1));
      setAnalysis(parsed);
      setTab('results');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: G.pageBg, fontFamily: appleFont }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select option { background: #1C1C1E; color: rgba(255,255,255,0.9); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp .35s ease forwards; }
      `}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(30px)', borderBottom: `1px solid ${G.separator}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #0A84FF, #5AC8FA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📊</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: G.textPrimary }}>PostIQ</span>
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: 3, gap: 2, border: `1px solid ${G.borderHair}` }}>
            {[{ key: 'input', label: 'Posts' }, { key: 'results', label: `Analysis${analysis ? ' ✓' : ''}` }].map(({ key, label }) => {
              const active = tab === key;
              const disabled = key === 'results' && !analysis;
              return (
                <button key={key} onClick={() => !disabled && setTab(key)} style={{ padding: '6px 16px', background: active ? 'rgba(255,255,255,0.12)' : 'transparent', border: '1px solid transparent', borderRadius: 8, color: active ? G.textPrimary : disabled ? G.textQuaternary : G.textTertiary, cursor: disabled ? 'default' : 'pointer' }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 70px' }}>
        {tab === 'input' && (
          <div className="fade-up">
            {posts.map((post, i) => {
              const pm = PLATFORM_META[post.platform];
              return (
                <GlassCard key={post.id} glow={pm.glow} style={{ marginBottom: 14 }}>
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${G.separator}`, display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: G.textQuaternary }}>Post {i + 1}</span>
                      <span style={{ color: pm.color }}>{pm.emoji} {post.platform}</span>
                    </div>
                    {posts.length > 2 && <button onClick={() => setPosts((ps) => ps.filter((p) => p.id !== post.id))} style={{ background: 'none', border: 'none', color: G.red }}>Remove</button>}
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div><FieldLabel>Platform</FieldLabel><GlassSelect value={post.platform} onChange={(v) => update(post.id, 'platform', v)} options={PLATFORMS} /></div>
                      <div><FieldLabel>Format</FieldLabel><GlassSelect value={post.postType} onChange={(v) => update(post.id, 'postType', v)} options={POST_TYPES[post.platform]} /></div>
                    </div>
                    <div style={{ marginBottom: 14 }}><FieldLabel>Caption *</FieldLabel><GlassInput multiline value={post.caption} onChange={(v) => update(post.id, 'caption', v)} placeholder={`Paste your ${post.platform} post here…`} /></div>
                    <div style={{ marginBottom: 14 }}><ImageDropzone imagePreview={post.imagePreview} onUpload={(d) => setImage(post.id, d)} onRemove={() => setImage(post.id, null)} /></div>
                    <div style={{ height: 1, background: G.separator, margin: '6px 0 14px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10 }}>
                      <MetricField label="Impressions" value={post.impressions} onChange={(v) => update(post.id, 'impressions', v)} placeholder="12,400" accentColor={G.purple} />
                      <MetricField label="Engagements" value={post.engagements} onChange={(v) => update(post.id, 'engagements', v)} placeholder="486" accentColor={G.blue} />
                      <MetricField label="Comments" value={post.comments} onChange={(v) => update(post.id, 'comments', v)} placeholder="52" accentColor={G.orange} />
                      <MetricField label="Shares" value={post.shares} onChange={(v) => update(post.id, 'shares', v)} placeholder="21" accentColor={G.teal} />
                    </div>
                    <EngagementRateBar post={post} />
                  </div>
                </GlassCard>
              );
            })}

            <button onClick={() => setPosts((ps) => [...ps, newPost(PLATFORMS[ps.length % 3])])} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1.5px dashed ${G.borderMid}`, borderRadius: 16, padding: 15, color: G.blue, marginBottom: 14 }}>
              + Add Post
            </button>

            {error && <div style={{ background: G.redSoft, border: `1px solid rgba(255,69,58,0.25)`, borderRadius: 12, padding: '13px 16px', marginBottom: 14, color: G.red }}>{error}</div>}

            <button onClick={analyze} disabled={loading || !canAnalyze} style={{ width: '100%', background: canAnalyze && !loading ? 'linear-gradient(135deg, #0A84FF, #5AC8FA)' : 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 14, padding: 17, color: canAnalyze && !loading ? '#fff' : G.textTertiary, fontSize: 16 }}>
              {loading ? 'Analyzing…' : 'Analyze Performance'}
            </button>
          </div>
        )}

        {tab === 'results' && analysis && (
          <div className="fade-up" ref={resultsRef}>
            <GlassCard glow={G.blueGlow} style={{ marginBottom: 14, background: 'rgba(10,132,255,0.08)' }}>
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: G.blue, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Analysis Summary</div>
                <p style={{ color: G.textSecondary, lineHeight: 1.7 }}>{analysis.summary}</p>
              </div>
            </GlassCard>

            <SectionLabel>Post Rankings</SectionLabel>
            <GlassCard style={{ marginBottom: 14 }}>
              {(analysis.postRankings || []).map((r, i, arr) => {
                const post = posts[r.index - 1];
                if (!post) return null;
                return (
                  <div key={r.index} style={{ padding: '13px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${G.separator}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: G.textPrimary }}>{i + 1}</span>
                    <div style={{ flex: 1 }}><div style={{ color: G.textPrimary, fontSize: 13 }}>{post.caption || '(No caption)'}</div><div style={{ color: G.textTertiary, fontSize: 11 }}>{r.reason}</div></div>
                    <TierChip tier={r.tier} />
                  </div>
                );
              })}
            </GlassCard>

            <SectionLabel>Key Insights</SectionLabel>
            <GlassCard style={{ marginBottom: 14 }}>
              {(analysis.keyInsights || []).map((ins, i, arr) => (
                <div key={i} style={{ padding: '16px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${G.separator}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}><span style={{ color: G.textPrimary }}>{ins.title}</span><ImpactBadge impact={ins.impact} /></div>
                  <p style={{ color: G.textSecondary, lineHeight: 1.6 }}>{ins.detail}</p>
                </div>
              ))}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
