import React, { useState, useEffect, useCallback, useRef } from 'react';

// Daily puzzle seed based on date
const getDailySeed = () => {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

// Seeded random for daily consistency
const seededRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// Generate daily puzzle
const generatePuzzle = (seed) => {
  const puzzles = [
    {
      id: 1,
      name: "First Steps",
      description: "Guide the robot to the flag 🚩",
      grid: [
        ['·', '·', '·', '·', '·', '·', '·', '·'],
        ['·', '🤖', '·', '·', '·', '·', '·', '·'],
        ['·', '·', '·', '█', '█', '·', '·', '·'],
        ['·', '·', '·', '█', '█', '·', '·', '·'],
        ['·', '·', '·', '·', '·', '·', '·', '·'],
        ['·', '·', '·', '·', '·', '·', '🚩', '·'],
        ['·', '·', '·', '·', '·', '·', '·', '·'],
        ['·', '·', '·', '·', '·', '·', '·', '·'],
      ],
      startPos: { x: 1, y: 1 },
      startDir: 0,
      goal: { x: 6, y: 5 },
      maxInstructions: 8,
      optimalInstructions: 6,
      stars: [8, 7, 6],
    },
    {
      id: 2,
      name: "Gem Collector",
      description: "Collect all gems 💎 then reach the exit",
      grid: [
        ['·', '·', '·', '·', '·', '·', '·', '·'],
        ['·', '🤖', '·', '💎', '·', '·', '·', '·'],
        ['·', '·', '·', '·', '·', '█', '·', '·'],
        ['·', '💎', '·', '█', '·', '█', '·', '·'],
        ['·', '·', '·', '█', '·', '·', '💎', '·'],
        ['·', '·', '·', '·', '·', '·', '·', '·'],
        ['·', '·', '💎', '·', '·', '·', '🚩', '·'],
        ['·', '·', '·', '·', '·', '·', '·', '·'],
      ],
      startPos: { x: 1, y: 1 },
      startDir: 0,
      goal: { x: 6, y: 6 },
      gems: [{x: 3, y: 1}, {x: 1, y: 3}, {x: 6, y: 4}, {x: 2, y: 6}],
      maxInstructions: 20,
      optimalInstructions: 14,
      stars: [18, 16, 14],
    },
    {
      id: 3,
      name: "The Maze",
      description: "Find your way through the labyrinth",
      grid: [
        ['█', '█', '█', '█', '█', '█', '█', '█'],
        ['·', '🤖', '·', '·', '·', '█', '·', '█'],
        ['█', '█', '█', '█', '·', '█', '·', '█'],
        ['█', '·', '·', '·', '·', '·', '·', '█'],
        ['█', '·', '█', '█', '█', '█', '·', '█'],
        ['█', '·', '·', '·', '·', '█', '·', '█'],
        ['█', '█', '█', '█', '·', '·', '·', '🚩'],
        ['█', '█', '█', '█', '█', '█', '█', '█'],
      ],
      startPos: { x: 1, y: 1 },
      startDir: 0,
      goal: { x: 7, y: 6 },
      maxInstructions: 25,
      optimalInstructions: 18,
      stars: [24, 21, 18],
    },
    {
      id: 4,
      name: "Loop Master",
      description: "Use loops to optimize your code",
      grid: [
        ['·', '·', '·', '·', '·', '·', '·', '·'],
        ['·', '🤖', '·', '·', '·', '·', '·', '·'],
        ['·', '·', '·', '·', '·', '·', '·', '·'],
        ['·', '·', '·', '·', '·', '·', '·', '·'],
        ['·', '·', '·', '·', '·', '·', '·', '·'],
        ['·', '·', '·', '·', '·', '·', '·', '·'],
        ['·', '·', '·', '·', '·', '·', '🚩', '·'],
        ['·', '·', '·', '·', '·', '·', '·', '·'],
      ],
      startPos: { x: 1, y: 1 },
      startDir: 0,
      goal: { x: 6, y: 6 },
      maxInstructions: 6,
      optimalInstructions: 4,
      stars: [6, 5, 4],
    },
  ];

  const index = Math.floor(seededRandom(seed) * puzzles.length);
  return puzzles[index];
};

// Language documentation - ENGLISH SYNTAX
const DOCS = {
  title: "📖 Pix Language Reference",
  sections: [
    {
      name: "Movement",
      commands: [
        { syntax: "move(n)", desc: "Move forward n steps", example: "move(3)" },
        { syntax: "right()", desc: "Turn right 90°", example: "right()" },
        { syntax: "left()", desc: "Turn left 90°", example: "left()" },
      ]
    },
    {
      name: "Control Flow",
      commands: [
        { syntax: "repeat(n) { ... }", desc: "Repeat n times", example: "repeat(4) { move(1) }" },
        { syntax: "if wall { ... }", desc: "If wall ahead", example: "if wall { right() }" },
        { syntax: "if !wall { ... }", desc: "If no wall ahead", example: "if !wall { move(1) }" },
        { syntax: "if gem { ... }", desc: "If gem at position", example: "if gem { grab() }" },
        { syntax: "while !wall { ... }", desc: "While no wall", example: "while !wall { move(1) }" },
      ]
    },
    {
      name: "Actions",
      commands: [
        { syntax: "grab()", desc: "Collect a gem", example: "grab()" },
      ]
    }
  ]
};

// Block types for drag & drop
const BLOCKS = [
  { id: 'move', label: 'move', color: '#10b981', syntax: 'move', hasParam: true, defaultParam: 1 },
  { id: 'right', label: 'right', color: '#f59e0b', syntax: 'right()', hasParam: false },
  { id: 'left', label: 'left', color: '#f59e0b', syntax: 'left()', hasParam: false },
  { id: 'repeat', label: 'repeat', color: '#8b5cf6', syntax: 'repeat', hasParam: true, isContainer: true, defaultParam: 2 },
  { id: 'if_wall', label: 'if wall', color: '#ef4444', syntax: 'if wall', isContainer: true },
  { id: 'if_no_wall', label: 'if !wall', color: '#06b6d4', syntax: 'if !wall', isContainer: true },
  { id: 'while_no_wall', label: 'while !wall', color: '#0ea5e9', syntax: 'while !wall', isContainer: true },
  { id: 'grab', label: 'grab', color: '#ec4899', syntax: 'grab()', hasParam: false },
];

// Tokenizer for Pix language
const tokenize = (code) => {
  const tokens = [];
  let pos = 0;

  const skipWhitespace = () => {
    while (pos < code.length && /\s/.test(code[pos])) pos++;
  };

  const skipComment = () => {
    if (code.slice(pos, pos + 2) === '//') {
      while (pos < code.length && code[pos] !== '\n') pos++;
    }
  };

  const readWord = () => {
    let word = '';
    while (pos < code.length && /[a-zA-Z_!]/.test(code[pos])) {
      word += code[pos++];
    }
    return word;
  };

  const readNumber = () => {
    let num = '';
    while (pos < code.length && /[0-9]/.test(code[pos])) {
      num += code[pos++];
    }
    return parseInt(num);
  };

  const readBlock = () => {
    let depth = 1;
    let block = '';
    pos++; // skip opening {
    while (pos < code.length && depth > 0) {
      if (code[pos] === '{') depth++;
      if (code[pos] === '}') depth--;
      if (depth > 0) block += code[pos];
      pos++;
    }
    return block;
  };

  while (pos < code.length) {
    skipWhitespace();
    skipComment();
    skipWhitespace();

    if (pos >= code.length) break;

    const word = readWord();
    if (!word) {
      pos++;
      continue;
    }

    skipWhitespace();

    switch (word) {
      case 'move': {
        if (code[pos] === '(') {
          pos++;
          skipWhitespace();
          const num = readNumber() || 1;
          skipWhitespace();
          if (code[pos] === ')') pos++;
          tokens.push({ type: 'move', value: num });
        }
        break;
      }

      case 'right': {
        if (code[pos] === '(') { pos++; if (code[pos] === ')') pos++; }
        tokens.push({ type: 'right' });
        break;
      }

      case 'left': {
        if (code[pos] === '(') { pos++; if (code[pos] === ')') pos++; }
        tokens.push({ type: 'left' });
        break;
      }

      case 'grab': {
        if (code[pos] === '(') { pos++; if (code[pos] === ')') pos++; }
        tokens.push({ type: 'grab' });
        break;
      }

      case 'repeat': {
        if (code[pos] === '(') {
          pos++;
          skipWhitespace();
          const count = readNumber() || 1;
          skipWhitespace();
          if (code[pos] === ')') pos++;
        }
        skipWhitespace();
        // Check for number without parens
        let count = 1;
        if (/[0-9]/.test(code[pos])) {
          count = readNumber();
        } else if (code[pos] === '(') {
          pos++;
          skipWhitespace();
          count = readNumber() || 1;
          skipWhitespace();
          if (code[pos] === ')') pos++;
        }
        skipWhitespace();
        if (code[pos] === '{') {
          const body = readBlock();
          tokens.push({ type: 'repeat', count, body: tokenize(body) });
        }
        break;
      }

      case 'if': {
        skipWhitespace();
        let condition = readWord();
        skipWhitespace();
        if (code[pos] === '{') {
          const body = readBlock();
          tokens.push({ type: 'if', condition, body: tokenize(body) });
        }
        break;
      }

      case 'while': {
        skipWhitespace();
        let condition = readWord();
        skipWhitespace();
        if (code[pos] === '{') {
          const body = readBlock();
          tokens.push({ type: 'while', condition, body: tokenize(body) });
        }
        break;
      }
    }
  }

  return tokens;
};

// Count instructions
const countInstructions = (tokens) => {
  let count = 0;
  for (const token of tokens) {
    count++;
    if (token.body) {
      count += countInstructions(token.body);
    }
  }
  return count;
};

// Direction vectors
const DIRS = [
  { x: 1, y: 0 },  // right (0)
  { x: 0, y: 1 },  // down (1)
  { x: -1, y: 0 }, // left (2)
  { x: 0, y: -1 }, // up (3)
];

const DIR_NAMES = ['→ East', '↓ South', '← West', '↑ North'];

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
  const [draggedBlock, setDraggedBlock] = useState(null);
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

  // Check if position is valid
  const isValidPos = useCallback((x, y, currentGrid) => {
    if (x < 0 || y < 0 || y >= currentGrid.length || x >= currentGrid[0].length) return false;
    return currentGrid[y][x] !== '█';
  }, []);

  // Check conditions
  const checkCondition = useCallback((condition, pos, dir, currentGrid, currentGems) => {
    const ahead = { x: pos.x + DIRS[dir].x, y: pos.y + DIRS[dir].y };
    const wallAhead = !isValidPos(ahead.x, ahead.y, currentGrid);
    const gemHere = currentGems.some(g => g.x === pos.x && g.y === pos.y);

    switch (condition) {
      case 'wall': return wallAhead;
      case '!wall': return !wallAhead;
      case 'gem': return gemHere;
      case '!gem': return !gemHere;
      default: return false;
    }
  }, [isValidPos]);

  // Execute tokens
  const executeTokens = useCallback(async (tokens, state, gridState, gems) => {
    let { x, y, dir } = state;
    let currentGrid = JSON.parse(JSON.stringify(gridState));
    let currentGems = [...gems];
    const log = [];
    let stepCount = 0;
    const maxSteps = 500;

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const execute = async (tokenList) => {
      for (const token of tokenList) {
        if (abortRef.current) return { x, y, dir, grid: currentGrid, gems: currentGems, log, success: false, aborted: true };
        if (stepCount++ > maxSteps) {
          log.push(`⚠️ Infinite loop detected!`);
          return { x, y, dir, grid: currentGrid, gems: currentGems, log, success: false, error: 'infinite' };
        }

        switch (token.type) {
          case 'move': {
            for (let i = 0; i < token.value; i++) {
              if (abortRef.current) return { x, y, dir, grid: currentGrid, gems: currentGems, log, success: false, aborted: true };

              const nextX = x + DIRS[dir].x;
              const nextY = y + DIRS[dir].y;

              if (!isValidPos(nextX, nextY, currentGrid)) {
                log.push(`💥 Collision at (${nextX}, ${nextY})!`);
                setExecutionLog([...log]);
                return { x, y, dir, grid: currentGrid, gems: currentGems, log, success: false, error: 'collision' };
              }

              currentGrid[y][x] = '·';
              x = nextX;
              y = nextY;
              currentGrid[y][x] = '🤖';

              log.push(`move → (${x}, ${y})`);
              setRobot({ x, y, dir });
              setGrid([...currentGrid]);
              setExecutionLog([...log]);
              await delay(180);
            }
            break;
          }

          case 'right': {
            dir = (dir + 1) % 4;
            log.push(`right() → facing ${DIR_NAMES[dir]}`);
            setRobot({ x, y, dir });
            setExecutionLog([...log]);
            await delay(120);
            break;
          }

          case 'left': {
            dir = (dir + 3) % 4;
            log.push(`left() → facing ${DIR_NAMES[dir]}`);
            setRobot({ x, y, dir });
            setExecutionLog([...log]);
            await delay(120);
            break;
          }

          case 'grab': {
            const gemIndex = currentGems.findIndex(g => g.x === x && g.y === y);
            if (gemIndex !== -1) {
              currentGems.splice(gemIndex, 1);
              log.push(`grab() → 💎 collected!`);
              setCollectedGems(prev => [...prev, { x, y }]);
            } else {
              log.push(`grab() → no gem here`);
            }
            setExecutionLog([...log]);
            await delay(100);
            break;
          }

          case 'repeat': {
            for (let i = 0; i < token.count; i++) {
              if (abortRef.current) return { x, y, dir, grid: currentGrid, gems: currentGems, log, success: false, aborted: true };
              log.push(`repeat ${i + 1}/${token.count}`);
              setExecutionLog([...log]);
              const loopResult = await execute(token.body);
              if (!loopResult.success) return loopResult;
              x = loopResult.x;
              y = loopResult.y;
              dir = loopResult.dir;
              currentGrid = loopResult.grid;
              currentGems = loopResult.gems;
            }
            break;
          }

          case 'if': {
            const shouldExecute = checkCondition(token.condition, { x, y }, dir, currentGrid, currentGems);
            log.push(`if ${token.condition} → ${shouldExecute ? 'true' : 'false'}`);
            setExecutionLog([...log]);

            if (shouldExecute) {
              const condResult = await execute(token.body);
              if (!condResult.success) return condResult;
              x = condResult.x;
              y = condResult.y;
              dir = condResult.dir;
              currentGrid = condResult.grid;
              currentGems = condResult.gems;
            }
            break;
          }

          case 'while': {
            while (checkCondition(token.condition, { x, y }, dir, currentGrid, currentGems)) {
              if (abortRef.current) return { x, y, dir, grid: currentGrid, gems: currentGems, log, success: false, aborted: true };
              if (stepCount++ > maxSteps) {
                log.push(`⚠️ Infinite loop detected!`);
                return { x, y, dir, grid: currentGrid, gems: currentGems, log, success: false, error: 'infinite' };
              }

              log.push(`while ${token.condition} → true`);
              setExecutionLog([...log]);
              const whileResult = await execute(token.body);
              if (!whileResult.success) return whileResult;
              x = whileResult.x;
              y = whileResult.y;
              dir = whileResult.dir;
              currentGrid = whileResult.grid;
              currentGems = whileResult.gems;
            }
            log.push(`while ${token.condition} → false (exit)`);
            setExecutionLog([...log]);
            break;
          }
        }
      }
      return { x, y, dir, grid: currentGrid, gems: currentGems, log, success: true };
    };

    return execute(tokens);
  }, [isValidPos, checkCondition]);

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
        puzzle.gems || []
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

  // Convert blocks to tokens
  const blocksToTokens = (blockList) => {
    return blockList.map(block => {
      switch (block.type) {
        case 'move':
          return { type: 'move', value: block.param || 1 };
        case 'right':
          return { type: 'right' };
        case 'left':
          return { type: 'left' };
        case 'grab':
          return { type: 'grab' };
        case 'repeat':
          return { type: 'repeat', count: block.param || 2, body: blocksToTokens(block.children || []) };
        case 'if_wall':
          return { type: 'if', condition: 'wall', body: blocksToTokens(block.children || []) };
        case 'if_no_wall':
          return { type: 'if', condition: '!wall', body: blocksToTokens(block.children || []) };
        case 'while_no_wall':
          return { type: 'while', condition: '!wall', body: blocksToTokens(block.children || []) };
        default:
          return null;
      }
    }).filter(Boolean);
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

        {/* Right: Code editor */}
        <div style={{ flex: '1 1 400px' }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setMode('code')}
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
              onClick={() => setMode('blocks')}
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
          {showDocs && (
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
          )}

          {/* Code editor */}
          {mode === 'code' && (
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
          )}

          {/* Block editor */}
          {mode === 'blocks' && (
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
          )}

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
                      onClick={submitScore}
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
