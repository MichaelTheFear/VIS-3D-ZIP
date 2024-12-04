//File to contain all main constants for the project (maybe put it into a json file later)

export const height = 224;
export const width = height;
export const distance = 120;
export const boxSize = 75;
export const batchSize = 1024;
export const repeats = 2;
export const stratificationPorcentage = 1.0;
export const batchNumber = 0;
export const startsAt = batchSize / (repeats * 8) * batchNumber;