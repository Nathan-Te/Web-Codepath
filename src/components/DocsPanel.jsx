import React from 'react';
import { DOCS } from '../language/docs';

export default function DocsPanel() {
  return (
    <div style={{
      background: '#1e293b',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      border: '1px solid #8b5cf6',
      fontSize: 13,
    }}>
      <h3 style={{ margin: '0 0 12px', color: '#c4b5fd' }}>{DOCS.title}</h3>
      {DOCS.sections.map((section, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <h4 style={{ margin: '0 0 6px', color: '#a78bfa' }}>{section.name}</h4>
          {section.commands.map((cmd, j) => (
            <div key={j} style={{ display: 'flex', gap: 12, padding: '3px 0', color: '#94a3b8' }}>
              <code style={{ color: '#38bdf8', minWidth: 180 }}>{cmd.syntax}</code>
              <span>{cmd.desc}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
