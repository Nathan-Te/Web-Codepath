// Language documentation - ENGLISH SYNTAX
export const DOCS = {
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

// Action blocks
export const ACTION_BLOCKS = [
  { id: 'move', label: 'move', color: '#10b981', hasParam: true, defaultParam: 1 },
  { id: 'right', label: 'right', color: '#f59e0b' },
  { id: 'left', label: 'left', color: '#f59e0b' },
  { id: 'grab', label: 'grab', color: '#ec4899' },
];

// Container blocks (accept nested children)
export const CONTAINER_BLOCKS = [
  { id: 'repeat', label: 'repeat', color: '#8b5cf6', hasParam: true, defaultParam: 2 },
  { id: 'if', label: 'if', color: '#ef4444', hasCondition: true },
  { id: 'while', label: 'while', color: '#0ea5e9', hasCondition: true },
];

// Condition blocks (droppable into condition slots of if/while)
export const CONDITION_BLOCKS = [
  { id: 'wall', label: 'wall', color: '#b91c1c' },
  { id: '!wall', label: '!wall', color: '#0e7490' },
  { id: 'gem', label: 'gem', color: '#a855f7' },
  { id: '!gem', label: '!gem', color: '#7c3aed' },
];

// All block definitions combined (for lookups)
export const ALL_BLOCKS = [...ACTION_BLOCKS, ...CONTAINER_BLOCKS, ...CONDITION_BLOCKS];
