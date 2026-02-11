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

// Block types for drag & drop
export const BLOCKS = [
  { id: 'move', label: 'move', color: '#10b981', syntax: 'move', hasParam: true, defaultParam: 1 },
  { id: 'right', label: 'right', color: '#f59e0b', syntax: 'right()', hasParam: false },
  { id: 'left', label: 'left', color: '#f59e0b', syntax: 'left()', hasParam: false },
  { id: 'repeat', label: 'repeat', color: '#8b5cf6', syntax: 'repeat', hasParam: true, isContainer: true, defaultParam: 2 },
  { id: 'if_wall', label: 'if wall', color: '#ef4444', syntax: 'if wall', isContainer: true },
  { id: 'if_no_wall', label: 'if !wall', color: '#06b6d4', syntax: 'if !wall', isContainer: true },
  { id: 'while_no_wall', label: 'while !wall', color: '#0ea5e9', syntax: 'while !wall', isContainer: true },
  { id: 'grab', label: 'grab', color: '#ec4899', syntax: 'grab()', hasParam: false },
];
