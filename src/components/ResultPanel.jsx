import React from 'react';

export default function ResultPanel({ result, submitted, finalScore, onSubmitScore }) {
  return (
    <>
      {/* Result panel */}
      {result && (
        <div style={{
          marginTop: 12,
          padding: 16,
          borderRadius: 12,
          background: result.type === 'success' ? '#064e3b' : '#7f1d1d',
          border: `1px solid ${result.type === 'success' ? '#10b981' : '#ef4444'}`,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{result.message}</div>
          {result.type === 'success' && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              <div>Stars: {'⭐'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}</div>
              <div>Instructions: {result.instructions} (optimal: {result.optimal})</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24', marginTop: 4 }}>
                Score: {result.score}
              </div>
              {!submitted && (
                <button
                  onClick={onSubmitScore}
                  style={{
                    marginTop: 8,
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#3b82f6',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                  }}
                >
                  Submit Score
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submitted state */}
      {submitted && (
        <div style={{
          marginTop: 12,
          padding: 16,
          borderRadius: 12,
          background: '#1e293b',
          border: '1px solid #3b82f6',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8' }}>
            Today's puzzle completed!
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24', marginTop: 4 }}>
            Final Score: {finalScore}
          </div>
          <div style={{ color: '#94a3b8', marginTop: 4, fontSize: 13 }}>
            Come back tomorrow for a new puzzle!
          </div>
        </div>
      )}
    </>
  );
}
