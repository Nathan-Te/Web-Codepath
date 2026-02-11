// Direction vectors
export const DIRS = [
  { x: 1, y: 0 },  // right (0)
  { x: 0, y: 1 },  // down (1)
  { x: -1, y: 0 }, // left (2)
  { x: 0, y: -1 }, // up (3)
];

export const DIR_NAMES = ['→ East', '↓ South', '← West', '↑ North'];

// Count instructions
export const countInstructions = (tokens) => {
  let count = 0;
  for (const token of tokens) {
    count++;
    if (token.body) {
      count += countInstructions(token.body);
    }
  }
  return count;
};

// Check if position is valid
export const isValidPos = (x, y, currentGrid) => {
  if (x < 0 || y < 0 || y >= currentGrid.length || x >= currentGrid[0].length) return false;
  return currentGrid[y][x] !== '█';
};

// Check conditions
export const checkCondition = (condition, pos, dir, currentGrid, currentGems) => {
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
};

// Execute tokens with animation
export const executeTokens = async (tokens, state, gridState, gems, callbacks) => {
  const { abortRef, setRobot, setGrid, setExecutionLog, setCollectedGems } = callbacks;

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
};
