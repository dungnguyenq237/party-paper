/** Build bounded, printable game data without mutating user input. */
export function buildGame(kind, input, random = Math.random) {
  const entries = [...new Set(input.map(item => item.trim()).filter(Boolean))];
  if (!entries.length || entries.length > 48) throw new Error('Use between 1 and 48 entries.');
  if (entries.some(item => item.length > 180)) throw new Error('Keep each entry within 180 characters.');
  if (kind === 'quiz') return entries.map((entry, index) => {
    const parts = entry.split('|').map(part => part.trim());
    if (parts.length !== 2 || parts.some(part => !part)) throw new Error(`Line ${index + 1}: use question | answer.`);
    return {prompt: parts[0], answer: parts[1]};
  });
  if (kind === 'scramble') {
    const words = [...new Set(entries.map(word => word.toUpperCase().replace(/[\s-]/g, '')))];
    return words.map(answer => {
      if (!/^[A-Z]{3,16}$/.test(answer) || new Set(answer).size < 2) throw new Error('Use 3–16 English letters with at least two different letters per word.');
      let prompt = answer;
      for (let attempt = 0; attempt < 20 && prompt === answer; attempt++) {
        const letters = [...answer];
        for (let i = letters.length - 1; i > 0; i--) {const j = Math.floor(random() * (i + 1)); [letters[i], letters[j]] = [letters[j], letters[i]];}
        prompt = letters.join('');
      }
      if (prompt === answer) prompt = answer.slice(1) + answer[0];
      return {prompt, answer};
    });
  }
  if (!['cards', 'checklist'].includes(kind)) throw new Error('Unknown game format.');
  return entries.map(prompt => ({prompt}));
}
export function chunks(items, size) {return Array.from({length: Math.ceil(items.length / size)}, (_, index) => items.slice(index * size, (index + 1) * size));}
