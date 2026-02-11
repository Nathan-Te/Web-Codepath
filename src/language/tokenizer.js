// Known keywords & conditions
const ACTIONS = ['move', 'right', 'left', 'grab'];
const CONTAINERS = ['repeat', 'if', 'while'];
const CONDITIONS = ['wall', '!wall', 'gem', '!gem'];
const ALL_KEYWORDS = [...ACTIONS, ...CONTAINERS];

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

// Validate code and return a list of errors with line numbers
export const validateCode = (code) => {
  const errors = [];
  const lines = code.split('\n');

  // Track brace depth for unclosed blocks
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    let line = lines[i];

    // Strip comment
    const commentIdx = line.indexOf('//');
    if (commentIdx !== -1) line = line.slice(0, commentIdx);

    line = line.trim();
    if (!line) continue;

    // Count braces on this line
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }

    if (braceDepth < 0) {
      errors.push({ line: lineNum, message: "Unexpected '}'" });
      braceDepth = 0;
      continue;
    }

    // Skip lines that are just closing braces
    if (/^\}+$/.test(line)) continue;

    // Try to match known patterns
    const wordMatch = line.match(/^([a-zA-Z_!]+)/);
    if (!wordMatch) continue;
    const word = wordMatch[1];

    // Action with parens: move(n), right(), left(), grab()
    if (ACTIONS.includes(word)) {
      if (word === 'move') {
        if (!/^move\s*\(\s*\d+\s*\)/.test(line)) {
          errors.push({ line: lineNum, message: "Expected: move(n)  e.g. move(3)" });
        }
      } else {
        const re = new RegExp(`^${word}\\s*\\(\\s*\\)`);
        if (!re.test(line)) {
          errors.push({ line: lineNum, message: `Expected: ${word}()` });
        }
      }
      continue;
    }

    // repeat(n) { ... }
    if (word === 'repeat') {
      if (!/^repeat\s*\(\s*\d+\s*\)\s*\{?/.test(line)) {
        errors.push({ line: lineNum, message: "Expected: repeat(n) { ... }  e.g. repeat(3) {" });
      } else if (!line.includes('{')) {
        errors.push({ line: lineNum, message: "Missing '{' after repeat(...)" });
      }
      continue;
    }

    // if / while <condition> { ... }
    if (word === 'if' || word === 'while') {
      const rest = line.slice(word.length).trim();
      const condMatch = rest.match(/^([a-zA-Z_!]+)/);
      if (!condMatch) {
        errors.push({ line: lineNum, message: `Missing condition after '${word}'. Expected: ${word} wall { ... }` });
        continue;
      }
      const cond = condMatch[1];
      if (!CONDITIONS.includes(cond)) {
        errors.push({ line: lineNum, message: `Unknown condition '${cond}'. Valid: ${CONDITIONS.join(', ')}` });
        continue;
      }
      const afterCond = rest.slice(condMatch[0].length).trim();
      if (!afterCond.startsWith('{')) {
        errors.push({ line: lineNum, message: `Missing '{' after '${word} ${cond}'` });
      }
      continue;
    }

    // Unknown keyword
    if (!ALL_KEYWORDS.includes(word) && !CONDITIONS.includes(word)) {
      errors.push({ line: lineNum, message: `Unknown instruction '${word}'` });
    }
  }

  // Check unclosed braces at end
  if (braceDepth > 0) {
    errors.push({ line: lines.length, message: `${braceDepth} unclosed '{'` });
  }

  return errors;
};
