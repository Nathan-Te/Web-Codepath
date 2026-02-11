// Convert blocks to tokens for the executor
export const blocksToTokens = (blockList) => {
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
      case 'if':
        return block.condition
          ? { type: 'if', condition: block.condition.type, body: blocksToTokens(block.children || []) }
          : null;
      case 'while':
        return block.condition
          ? { type: 'while', condition: block.condition.type, body: blocksToTokens(block.children || []) }
          : null;
      default:
        return null;
    }
  }).filter(Boolean);
};
