// Tokenizer for Pix language
export const tokenize = (code) => {
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
