// Daily puzzle seed based on date
export const getDailySeed = () => {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

// Seeded random for daily consistency
export const seededRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// Generate daily puzzle
export const generatePuzzle = (seed) => {
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
