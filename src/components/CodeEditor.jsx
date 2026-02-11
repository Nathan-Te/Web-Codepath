import React from 'react';

export default function CodeEditor({ code, setCode }) {
  return (
    <textarea
      value={code}
      onChange={(e) => setCode(e.target.value)}
      style={{
        width: '100%',
        minHeight: 200,
        background: '#0f172a',
        color: '#e2e8f0',
        border: '1px solid #334155',
        borderRadius: 12,
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
  );
}
