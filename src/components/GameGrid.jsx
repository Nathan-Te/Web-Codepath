import React from 'react';
import { DIR_NAMES } from '../engine/executor';

export default function GameGrid({ puzzle, grid, robot, collectedGems, executionLog }) {
  return (
    <div style={{ flex: '1 1 340px' }}>
      <div style={{
        background: '#1e293b',
        borderRadius: 12,
        padding: 16,
        border: '1px solid #334155',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${puzzle.grid[0].length}, 1fr)`,
          gap: 2,
          aspectRatio: '1',
        }}>
          {grid.flat().map((cell, i) => {
            const x = i % grid[0].length;
            const y = Math.floor(i / grid[0].length);
            const isGoal = x === puzzle.goal.x && y === puzzle.goal.y;
            const isRobot = x === robot.x && y === robot.y;
            const isCollected = collectedGems.some(g => g.x === x && g.y === y);

            let bg = '#0f172a';
            if (cell === '█') bg = '#475569';
            if (isGoal && !isRobot) bg = '#164e63';
            if (isRobot) bg = '#1e40af';

            const dirArrow = ['→', '↓', '←', '↑'][robot.dir];

            return (
              <div key={i} style={{
                background: bg,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                aspectRatio: '1',
                transition: 'background 0.15s',
                border: isGoal ? '1px solid #06b6d4' : '1px solid #1e293b',
              }}>
                {isRobot ? (
                  <span style={{ fontSize: 18 }}>
                    🤖<span style={{ fontSize: 10, position: 'relative', top: -4 }}>{dirArrow}</span>
                  </span>
                ) : isCollected ? '✓' : cell === '·' ? '' : cell}
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8' }}>
          <span>Robot: ({robot.x}, {robot.y}) {DIR_NAMES[robot.dir]}</span>
          {puzzle.gems && <span>Gems: {collectedGems.length}/{puzzle.gems.length}</span>}
        </div>
      </div>

      {/* Execution log */}
      <div style={{
        marginTop: 12,
        background: '#0f172a',
        borderRadius: 8,
        padding: 10,
        maxHeight: 140,
        overflowY: 'auto',
        fontSize: 12,
        border: '1px solid #334155',
      }}>
        <div style={{ color: '#64748b', marginBottom: 4 }}>Execution Log:</div>
        {executionLog.slice(-8).map((log, i) => (
          <div key={i} style={{ color: '#94a3b8', padding: '1px 0' }}>{log}</div>
        ))}
        {executionLog.length === 0 && <div style={{ color: '#475569' }}>No execution yet...</div>}
      </div>
    </div>
  );
}
