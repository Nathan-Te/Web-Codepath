// Convert blocks to tokens
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
