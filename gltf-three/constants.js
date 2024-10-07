export const height = 256;
export const width = height;
export const distance = 120;
export const boxSize = 75;
export const batchSize = 1024;
export const repeats = 2;
export const startsAt = batchSize / (repeats * 8) * 216; // if it starts in the beginning, 2605 -> 0