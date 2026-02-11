import React, { useState, useEffect, useCallback, useRef } from 'react';

// Data & Logic
import { getDailySeed, generatePuzzle } from './data/puzzles';
import { tokenize } from './language/tokenizer';
import { countInstructions, executeTokens } from './engine/executor';
import { blocksToTokens, tokensToBlocks, blocksToCode } from './engine/blocks';

// Components
import GameGrid from './components/GameGrid';
import CodeEditor from './components/CodeEditor';
import BlockEditor from './components/BlockEditor';
import DocsPanel from './components/DocsPanel';
import ResultPanel from './components/ResultPanel';

export default function CodePath() {
  const [mode, setMode] = useState('code');
  const [puzzle, setPuzzle] = useState(null);
  const [code, setCode] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [robot, setRobot] = useState({ x: 0, y: 0, dir: 0 });
  const [grid, setGrid] = useState([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [showDocs, setShowDocs] = useState(false);
  const [collectedGems, setCollectedGems] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const abortRef = useRef(false);

  const seed = getDailySeed();
  const dayNumber = Math.floor((Date.now() - new Date('2025-01-01').getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Initialize puzzle
  useEffect(() => {
    const p = generatePuzzle(seed);
    setPuzzle(p);
    setGrid(JSON.parse(JSON.stringify(p.grid)));
    setRobot({ x: p.startPos.x, y: p.startPos.y, dir: p.startDir });
    setCollectedGems([]);
    setResult(null);
    setExecutionLog([]);

    // Set starter code
    setCode(`// Move the robot to the goal!\n// Use move(n), right(), left()\n\nmove(5)\nright()\nmove(4)`);

    const saved = localStorage.getItem(`codepath-${seed}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.submitted) {
        setSubmitted(true);
        setFinalScore(data.score);
      }
    }
  }, [seed]);

  // Switch mode and sync code <-> blocks
  const switchMode = useCallback((newMode) => {
    if (newMode === mode) return;
    if (newMode === 'blocks') {
      // code -> blocks: parse the code text into block objects
      try {
        const tokens = tokenize(code);
        setBlocks(tokensToBlocks(tokens));
      } catch {
        // If parsing fails, keep current blocks
      }
    } else {
      // blocks -> code: convert block tree to code text
      const generated = blocksToCode(blocks);
      if (generated) setCode(generated);
    }
    setMode(newMode);
  }, [mode, code, blocks]);

  // Reset puzzle
  const resetPuzzle = useCallback(() => {
    if (!puzzle) return;
    abortRef.current = true;
    setTimeout(() => {
      abortRef.current = false;
      setGrid(JSON.parse(JSON.stringify(puzzle.grid)));
      setRobot({ x: puzzle.startPos.x, y: puzzle.startPos.y, dir: puzzle.startDir });
      setCollectedGems([]);
      setResult(null);
      setExecutionLog([]);
      setRunning(false);
    }, 50);
  }, [puzzle]);

  // Run code
  const runCode = async () => {
    if (!puzzle || running) return;

    resetPuzzle();
    await new Promise(r => setTimeout(r, 100));

    setRunning(true);
    setResult(null);
    abortRef.current = false;

    try {
      const tokens = mode === 'code' ? tokenize(code) : blocksToTokens(blocks);
      const instructionCount = countInstructions(tokens);

      if (instructionCount === 0) {
        setResult({ type: 'error', message: 'No instructions found!' });
        setRunning(false);
        return;
      }

      if (instructionCount > puzzle.maxInstructions) {
        setResult({
          type: 'error',
          message: `Too many instructions! Max: ${puzzle.maxInstructions}`
        });
        setRunning(false);
        return;
      }

      const finalState = await executeTokens(
        tokens,
        { x: puzzle.startPos.x, y: puzzle.startPos.y, dir: puzzle.startDir },
        JSON.parse(JSON.stringify(puzzle.grid)),
        puzzle.gems || [],
        { abortRef, setRobot, setGrid, setExecutionLog, setCollectedGems }
      );

      if (finalState.aborted) {
        setRunning(false);
        return;
      }

      if (!finalState.success) {
        if (finalState.error === 'infinite') {
          setResult({ type: 'error', message: '♾️ Infinite loop!' });
        } else {
          setResult({ type: 'error', message: '💥 Collision!' });
        }
      } else {
        const atGoal = finalState.x === puzzle.goal.x && finalState.y === puzzle.goal.y;
        const allGemsCollected = !puzzle.gems || finalState.gems.length === 0;

        if (atGoal && allGemsCollected) {
          let stars = 1;
          if (instructionCount <= puzzle.stars[1]) stars = 2;
          if (instructionCount <= puzzle.stars[2]) stars = 3;

          const score = Math.max(0, 1000 - instructionCount * 50);

          setResult({
            type: 'success',
            message: `🎉 Success!`,
            stars,
            instructions: instructionCount,
            optimal: puzzle.optimalInstructions,
            score
          });
        } else if (!atGoal) {
          setResult({ type: 'error', message: '📍 Goal not reached' });
        } else {
          setResult({ type: 'error', message: '💎 Gems remaining!' });
        }
      }
    } catch (e) {
      setResult({ type: 'error', message: `Syntax error: ${e.message}` });
    }

    setRunning(false);
  };

  // Submit score
  const submitScore = () => {
    if (!result || result.type !== 'success') return;
    const data = { submitted: true, score: result.score, stars: result.stars };
    localStorage.setItem(`codepath-${seed}`, JSON.stringify(data));
    setSubmitted(true);
    setFinalScore(result.score);
  };

  if (!puzzle) return <div style={{ color: '#fff', padding: 40 }}>Loading puzzle...</div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#e2e8f0',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#38bdf8' }}>
          🤖 CodePath - Day #{dayNumber}
        </h1>
        <p style={{ color: '#94a3b8', margin: '4px 0' }}>
          Puzzle: <strong>{puzzle.name}</strong> — {puzzle.description}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, maxWidth: 1200, margin: '0 auto', flexWrap: 'wrap' }}>
        {/* Left: Grid */}
        <GameGrid
          puzzle={puzzle}
          grid={grid}
          robot={robot}
          collectedGems={collectedGems}
          executionLog={executionLog}
        />

        {/* Right: Code editor */}
        <div style={{ flex: '1 1 400px' }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => switchMode('code')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: mode === 'code' ? '#3b82f6' : '#334155',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'inherit',
              }}
            >
              Code Editor
            </button>
            <button
              onClick={() => switchMode('blocks')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: mode === 'blocks' ? '#3b82f6' : '#334155',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'inherit',
              }}
            >
              Block Editor
            </button>
            <button
              onClick={() => setShowDocs(!showDocs)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: showDocs ? '#8b5cf6' : '#334155',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'inherit',
                marginLeft: 'auto',
              }}
            >
              📖 Docs
            </button>
          </div>

          {/* Documentation panel */}
          {showDocs && <DocsPanel />}

          {/* Code editor */}
          {mode === 'code' && <CodeEditor code={code} setCode={setCode} />}

          {/* Block editor */}
          {mode === 'blocks' && <BlockEditor blocks={blocks} setBlocks={setBlocks} />}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={runCode}
              disabled={running}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: running ? '#475569' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                cursor: running ? 'default' : 'pointer',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'inherit',
              }}
            >
              {running ? '⏳ Running...' : '▶ Run Code'}
            </button>
            <button
              onClick={resetPuzzle}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: '#334155',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 15,
                fontFamily: 'inherit',
              }}
            >
              🔄 Reset
            </button>
          </div>

          {/* Result & submission */}
          <ResultPanel
            result={result}
            submitted={submitted}
            finalScore={finalScore}
            onSubmitScore={submitScore}
          />

          {/* Info */}
          <div style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
            background: '#1e293b',
            border: '1px solid #334155',
            fontSize: 12,
            color: '#64748b',
          }}>
            Max instructions: {puzzle.maxInstructions} | Optimal: {puzzle.optimalInstructions} |
            Stars: ⭐{puzzle.stars[0]} ⭐⭐{puzzle.stars[1]} ⭐⭐⭐{puzzle.stars[2]}
          </div>
        </div>
      </div>
    </div>
  );
}
