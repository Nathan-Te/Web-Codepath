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

// Convert tokens (from tokenizer) to block objects (for block editor)
const genUid = () => Date.now() + Math.random();

export const tokensToBlocks = (tokens) => {
  return tokens.map(token => {
    switch (token.type) {
      case 'move':
        return { type: 'move', uid: genUid(), param: token.value || 1 };
      case 'right':
        return { type: 'right', uid: genUid() };
      case 'left':
        return { type: 'left', uid: genUid() };
      case 'grab':
        return { type: 'grab', uid: genUid() };
      case 'repeat':
        return {
          type: 'repeat', uid: genUid(),
          param: token.count || 2,
          children: tokensToBlocks(token.body || []),
        };
      case 'if':
        return {
          type: 'if', uid: genUid(),
          condition: token.condition ? { type: token.condition, uid: genUid() } : null,
          children: tokensToBlocks(token.body || []),
        };
      case 'while':
        return {
          type: 'while', uid: genUid(),
          condition: token.condition ? { type: token.condition, uid: genUid() } : null,
          children: tokensToBlocks(token.body || []),
        };
      default:
        return null;
    }
  }).filter(Boolean);
};

// Convert block tree to code text
export const blocksToCode = (blockList, indent = 0) => {
  const pad = '  '.repeat(indent);
  return blockList.map(block => {
    switch (block.type) {
      case 'move':
        return `${pad}move(${block.param || 1})`;
      case 'right':
        return `${pad}right()`;
      case 'left':
        return `${pad}left()`;
      case 'grab':
        return `${pad}grab()`;
      case 'repeat': {
        const body = blocksToCode(block.children || [], indent + 1);
        return `${pad}repeat(${block.param || 2}) {\n${body}\n${pad}}`;
      }
      case 'if': {
        const cond = block.condition ? block.condition.type : '???';
        const body = blocksToCode(block.children || [], indent + 1);
        return `${pad}if ${cond} {\n${body}\n${pad}}`;
      }
      case 'while': {
        const cond = block.condition ? block.condition.type : '???';
        const body = blocksToCode(block.children || [], indent + 1);
        return `${pad}while ${cond} {\n${body}\n${pad}}`;
      }
      default:
        return null;
    }
  }).filter(Boolean).join('\n');
};
