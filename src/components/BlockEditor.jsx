import React from 'react';
import { BLOCKS } from '../language/docs';

export default function BlockEditor({ blocks, setBlocks }) {
  return (
    <div>
      {/* Block palette */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
        padding: 10,
        background: '#1e293b',
        borderRadius: 8,
        border: '1px solid #334155',
      }}>
        {BLOCKS.map(block => (
          <button
            key={block.id}
            onClick={() => {
              setBlocks(prev => [...prev, {
                type: block.id,
                param: block.defaultParam,
                children: block.isContainer ? [] : undefined,
                uid: Date.now() + Math.random(),
              }]);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              background: block.color,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'inherit',
              fontWeight: 600,
            }}
          >
            + {block.label}
          </button>
        ))}
      </div>

      {/* Block workspace */}
      <div style={{
        minHeight: 200,
        background: '#0f172a',
        borderRadius: 12,
        padding: 12,
        border: '1px solid #334155',
      }}>
        {blocks.length === 0 && (
          <div style={{ color: '#475569', textAlign: 'center', padding: 40 }}>
            Click blocks above to add instructions
          </div>
        )}
        {blocks.map((block, idx) => {
          const blockDef = BLOCKS.find(b => b.id === block.type);
          return (
            <div key={block.uid} style={{
              background: blockDef?.color || '#334155',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{blockDef?.label}</span>
              {block.param !== undefined && (
                <input
                  type="number"
                  value={block.param}
                  onChange={(e) => {
                    const newBlocks = [...blocks];
                    newBlocks[idx].param = parseInt(e.target.value) || 1;
                    setBlocks(newBlocks);
                  }}
                  style={{
                    width: 40,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 4,
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                  min={1}
                  max={20}
                />
              )}
              <button
                onClick={() => setBlocks(prev => prev.filter((_, i) => i !== idx))}
                style={{
                  marginLeft: 'auto',
                  background: 'rgba(0,0,0,0.3)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 4,
                  cursor: 'pointer',
                  padding: '2px 8px',
                  fontSize: 12,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
