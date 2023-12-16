export const PROGRAMS_DB_CONFIG = {
  functionsPerPrompt: 2,
  numIslands: 10,
  resetPeriod: 4 * 60 * 60,
  clusterSamplingTemperatureInit: 0.1,
  clusterSamplingTemperaturePeriod: 30_000,
} as const;

export const CONFIG = {
  programsDatabase: PROGRAMS_DB_CONFIG,
  numSamplers: 15,
  numEvaluators: 140,
  samplesPerPrompt: 4,
} as const;
