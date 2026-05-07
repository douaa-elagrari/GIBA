'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { sendMessage, isSpaceAwake } from '@/service/gradioApi';

const SUGGESTED = [
  'How to request vacation?',
  'Combien dure le congé de maternité?',
  'What is the formation procedure?',
];

interface Message {
  role: 'bot' | 'user';
  text: string;
}

function TypingIndicator() {
  return (
    <div style={S.typing}>
      {[0, 1, 2].map(i => (
        <div key={i} className="hr-dot" style={{ ...S.dot, animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}

// Expand / Compress icons
function IconExpand() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}
function IconCompress() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
      <line x1="10" y1="14" x2="3" y2="21" /><line x1="21" y1="3" x2="14" y2="10" />
    </svg>
  );
}

// Elegant Copy Button
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    // Strip HTML tags for clean copy
    const plainText = text.replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      style={S.copyBtn}
      title="Copy message"
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export default function HRChatbot() {
  const [open, setOpen]           = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [input, setInput]         = useState('');
  const [messages, setMessages]   = useState<Message[]>([
    { role: 'bot', text: "Hi! I'm your HR assistant. How can I help you today?" },
  ]);
  const [loading, setLoading]     = useState(false);
  const [warming, setWarming]     = useState(false);
  const [showSugg, setShowSugg]   = useState(true);
  const [isMobile, setIsMobile]   = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 480);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    isSpaceAwake().then(awake => setWarming(!awake));
  }, [open]);

  // Lock body scroll when fullscreen/mobile
  useEffect(() => {
    if (open && (fullscreen || isMobile)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, fullscreen, isMobile]);

  const handleSend = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || loading) return;
    setInput('');
    setShowSugg(false);
    setWarming(false);
    setMessages(p => [...p, { role: 'user', text: query }]);
    setLoading(true);
    try {
      const answer = await sendMessage(query);
      setMessages(p => [...p, { role: 'bot', text: answer }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      const isAsleep = msg.includes('502') || msg.includes('503');
      if (isAsleep) setWarming(true);
      setMessages(p => [...p, {
        role: 'bot',
        text: isAsleep
          ? 'The assistant is warming up. Please try again in a few seconds.'
          : 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Determine window dimensions
  const isExpanded = fullscreen || isMobile;

  const windowStyle: React.CSSProperties = isExpanded
    ? {
        ...S.window,
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        position: 'fixed',
        inset: 0,
        zIndex: 1001,
        animation: isMobile ? 'slideIn 0.25s ease' : 'slideUp 0.2s ease',
      }
    : S.window;

  const overlayStyle: React.CSSProperties = isExpanded && open
    ? { ...S.overlay, bottom: 0, right: 0 }
    : S.overlay;

  // Autocomplete logic
  const autocompleteMatch = input.trim()
    ? SUGGESTED.find(q => q.toLowerCase().startsWith(input.toLowerCase()))
    : undefined;
  
  const autocompleteRemainder = autocompleteMatch && input
    ? autocompleteMatch.slice(input.length)
    : '';

  return (
    <div style={overlayStyle}>
      {open && (
        <div className="hr-window-anim" style={windowStyle}>
          {/* Header */}
          <div style={S.header}>
            <div style={S.avatarWrap}>
              <div style={S.avatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={S.title}>HR Assistant</p>
              <div style={S.statusRow}>
                <div style={S.statusDot} />
                <p style={S.sub}>Always here to help</p>
              </div>
            </div>

            {/* Fullscreen toggle — hidden on mobile (already fills screen) */}
            {!isMobile && (
              <button
                className="hr-fullscreen-btn"
                style={S.headerBtn}
                onClick={() => setFullscreen(f => !f)}
                title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {fullscreen ? <IconCompress /> : <IconExpand />}
              </button>
            )}

            <button
              className="hr-close"
              style={S.close}
              onClick={() => { setOpen(false); setFullscreen(false); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="hr-msgs" style={S.msgs}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === 'bot' ? S.botRow : S.userRow}>
                {m.role === 'bot' && (
                  <div style={S.botAvatar}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                )}
                {m.role === 'bot' ? (
                  <div style={S.botWrap} className="bot-msg-group">
                    <div
                      style={S.bot}
                      className="bot-html-content"
                      dangerouslySetInnerHTML={{ __html: m.text }}
                    />
                    <div className="bot-msg-actions">
                      <CopyButton text={m.text} />
                    </div>
                  </div>
                ) : (
                  <div style={S.userWrap} className="user-msg-group">
                    <div style={S.user}>{m.text}</div>
                    <div className="user-msg-actions">
                      <CopyButton text={m.text} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={S.botRow}>
                <div style={S.botAvatar}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <TypingIndicator />
              </div>
            )}
            {warming && <p style={S.warm}>Space is warming up — first reply may take ~30s</p>}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {showSugg && (
            <div style={S.suggWrap}>
              <p style={S.suggLabel}>Suggested questions</p>
              {SUGGESTED.slice(0, 3).map(q => (
                <button key={q} className="hr-sugg" style={S.sugg} onClick={() => handleSend(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={S.inputRow}>
            <div style={S.inputWrap}>
              <div style={S.autocompleteGhost}>
                <span style={{ color: 'transparent' }}>{input}</span>
                {autocompleteRemainder}
              </div>
              <input
                ref={inputRef}
                className="hr-input"
                style={S.input}
                placeholder="Ask me anything about HR..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Tab' && autocompleteRemainder) {
                    e.preventDefault(); 
                    setInput(autocompleteMatch!);
                  } else if (e.key === 'ArrowRight' && autocompleteRemainder) {
                    e.preventDefault();
                    setInput(autocompleteMatch!);
                  } else if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleSend(); 
                  }
                }}
                disabled={loading}
              />
            </div>
            <button
              className="hr-send"
              style={S.send}
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB — hidden on mobile when chat is open */}
      {(!isMobile || !open) && (
        <button
          className="hr-fab"
          style={S.fab}
          onClick={() => setOpen(o => !o)}
          aria-label="Open HR Assistant"
        >
          {open
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
          }
        </button>
      )}

      <style>{`
        .bot-msg-group {
          position: relative;
        }
        .bot-msg-actions {
          position: absolute;
          bottom: -10px;
          right: -10px;
          opacity: 0;
          transition: all 0.2s ease;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bot-msg-group:hover .bot-msg-actions {
          opacity: 1;
          transform: translateY(0);
        }
        .user-msg-group {
          position: relative;
        }
        .user-msg-actions {
          position: absolute;
          bottom: -10px;
          right: -10px;
          opacity: 0;
          transition: all 0.2s ease;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-msg-group:hover .user-msg-actions {
          opacity: 1;
          transform: translateY(0);
        }
        .hr-autocomplete-item:hover {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  overlay:   { position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, fontFamily: "'DM Sans',sans-serif" },
  fab:       { width: 52, height: 52, borderRadius: '50%', background: '#4f46e5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.35)', transition: 'all 0.2s' },
  window:    { width: 370, height: 560, borderRadius: 16, background: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.2s ease', border: '1px solid #f1f5f9' },
  header:    { background: '#4f46e5', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  avatarWrap:{ flexShrink: 0 },
  avatar:    { width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 15, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.3 },
  statusRow: { display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: '50%', background: '#34d399' },
  sub:       { fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: 0 },
  headerBtn: { background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' },
  close:     { background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', marginLeft: 'auto' },
  msgs:      { flex: 1, overflowY: 'auto', padding: '16px 14px 8px', display: 'flex', flexDirection: 'column', gap: 12, background: '#fafafa' },
  botRow:    { display: 'flex', alignItems: 'flex-end', gap: 8, alignSelf: 'flex-start', maxWidth: '88%' },
  userRow:   { display: 'flex', justifyContent: 'flex-end', maxWidth: '88%', alignSelf: 'flex-end' },
  botAvatar: { width: 26, height: 26, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #e0e7ff' },
  botWrap:   { position: 'relative' },
  userWrap:  { position: 'relative' },
  bot:       { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px 12px 12px 2px', padding: '10px 14px', fontSize: 13.5, color: '#1f2937', lineHeight: 1.6, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  user:      { background: '#4f46e5', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', fontSize: 13.5, color: '#fff', lineHeight: 1.6 },
  copyBtn:   { background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' },
  typing:    { display: 'flex', gap: 4, padding: '12px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px 12px 12px 2px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  dot:       { width: 6, height: 6, borderRadius: '50%', background: '#6366f1' },
  warm:      { fontSize: 12, color: '#f59e0b', textAlign: 'center', background: '#fffbeb', borderRadius: 8, padding: '6px 12px' },
  suggWrap:  { display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 14px 10px', background: '#fafafa', borderTop: '1px solid #f1f5f9', flexShrink: 0 },
  suggLabel: { fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '0 0 2px', letterSpacing: '0.3px' },
  sugg:      { background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#374151', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif" },
  inputRow:  { padding: '10px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, alignItems: 'center', background: '#fff', flexShrink: 0 },
  inputWrap: { flex: 1, position: 'relative', display: 'flex', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' },
  input:     { flex: 1, border: 'none', padding: '9px 14px', fontSize: 13.5, color: '#1f2937', background: 'transparent', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif", position: 'relative', zIndex: 2, outline: 'none' },
  autocompleteGhost: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: '9px 14px', fontSize: 13.5, color: '#9ca3af', pointerEvents: 'none', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'pre', zIndex: 1 },
  send:      { width: 38, height: 38, borderRadius: 10, background: '#4f46e5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' },
};
