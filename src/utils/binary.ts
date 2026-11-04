import { LevelConfig, Question } from '../types/game';

export function decimalToBinaryArray(decimal: number, bitsCount: number): { bits: number[]; placeValues: number[] } {
  const bits: number[] = [];
  const placeValues: number[] = [];

  for (let i = bitsCount - 1; i >= 0; i--) {
    const val = 1 << i;
    const bit = (decimal & val) ? 1 : 0;
    bits.push(bit);
    placeValues.push(val);
  }

  return { bits, placeValues };
}

export function generateQuestionForLevel(level: LevelConfig, excludeDecimals: number[] = []): Question {
  const range = level.maxDecimal - level.minDecimal + 1;
  let targetDec: number;
  let attempts = 0;

  do {
    targetDec = Math.floor(Math.random() * range) + level.minDecimal;
    attempts++;
  } while (excludeDecimals.includes(targetDec) && attempts < 30);

  const { bits, placeValues } = decimalToBinaryArray(targetDec, level.bitsCount);
  const binary = bits.join('');

  // Generate 3 plausible distractors
  const distractors = new Set<number>();

  // Distractor 1: Flip lowest or second lowest bit
  const flip1 = targetDec ^ 1;
  if (flip1 !== targetDec && flip1 >= 0) distractors.add(flip1);

  const flip2 = targetDec ^ 2;
  if (flip2 !== targetDec && flip2 >= 0) distractors.add(flip2);

  // Distractor 2: Off-by-one or off-by-two
  if (targetDec + 1 <= level.maxDecimal + 5) distractors.add(targetDec + 1);
  if (targetDec - 1 >= 0) distractors.add(targetDec - 1);
  if (targetDec + 2 <= level.maxDecimal + 5) distractors.add(targetDec + 2);

  // Distractor 3: High bit confusion or bit-shift
  const flipHigh = targetDec ^ (1 << Math.max(1, level.bitsCount - 1));
  if (flipHigh !== targetDec && flipHigh >= 0) distractors.add(flipHigh);

  // Distractor 4: Inverted bit order
  const rev = parseInt(bits.slice().reverse().join(''), 2);
  if (rev !== targetDec && rev >= 0) distractors.add(rev);

  // Fallback random values if set doesn't have 3 items
  let fallbackDelta = 3;
  while (distractors.size < 3) {
    const candidate = Math.max(0, targetDec + fallbackDelta);
    if (candidate !== targetDec) distractors.add(candidate);
    fallbackDelta = fallbackDelta > 0 ? -fallbackDelta : Math.abs(fallbackDelta) + 2;
  }

  // Pick 3 from the distractors
  const chosenDistractors = Array.from(distractors).filter(d => d !== targetDec).slice(0, 3);
  const options = [targetDec, ...chosenDistractors];

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    binary,
    decimalAnswer: targetDec,
    options,
    bits,
    placeValues,
  };
}

export function formatBinaryWithSpaces(binary: string): string {
  // Groups of 4 for easy reading on mobile/desktop (e.g. 1011 0010)
  if (binary.length <= 4) return binary;
  const rem = binary.length % 4;
  const prefix = rem > 0 ? binary.slice(0, rem) + ' ' : '';
  const rest = binary.slice(rem);
  const chunks = rest.match(/.{1,4}/g) || [];
  return (prefix + chunks.join(' ')).trim();
}
