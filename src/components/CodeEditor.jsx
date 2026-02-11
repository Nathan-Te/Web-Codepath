import React, { useMemo } from 'react';
import { validateCode } from '../language/tokenizer';

export default function CodeEditor({ code, setCode }) {
  const errors = useMemo(() => {
    const stripped = code.replace(/\/\/.*$/gm, '').trim();
    if (!stripped) return [];
    return validateCode(code);
  }, [code]);

  return (
    <div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{
          width: '100%',
          minHeight: 200,
          background: '#0f172a',
          color: '#e2e8f0',
          border: `1px solid ${errors.length > 0 ? '#ef4444' : '#334155'}`,
          borderRadius: errors.length > 0 ? '12px 12px 0 0' : 12,
          padding: 16,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 14,
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
          boxSizing: 'border-box',
        }}
        placeholder="Write your Pix code here..."
        spellCheck={false}
      />
      {errors.length > 0 && (
        <div style={{
          background: '#1c1017',
          border: '1px solid #ef4444',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: '8px 12px',
          maxHeight: 120,
          overflowY: 'auto',
        }}>
          {errors.map((err, i) => (
            <div key={i} style={{
              fontSize: 12,
              color: '#fca5a5',
              padding: '3px 0',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              display: 'flex',
              gap: 8,
            }}>
              <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>
                line {err.line}:
              </span>
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
