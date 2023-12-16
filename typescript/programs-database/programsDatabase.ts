import { PROGRAMS_DB_CONFIG } from "../config.ts";
import { Program } from "../code-manipulation/program.ts";
import { Function } from "../code-manipulation/function.ts";
import { Island } from "./island.ts";
import { Prompt } from "./prompt.ts";
import { ScoresPerTest } from "./types.ts";
import { reduceScore } from "./math.ts";

/**
 * A collection of programs, organized as islands
 */
export class ProgramsDatabase {
  private config = PROGRAMS_DB_CONFIG;
  private islands: Island[] = [];
  public bestScorePerIsland: number[];
  private bestProgramPerIsland: Function[];
  private bestScoresPerTestPerIsland: ScoresPerTest[];
  private lastResetTime: number;

  constructor(private template: Program, private functionToEvolve: string) {
    const { config } = this;

    // initialze islands
    for (let i = 0; i < config.numIslands; i++) {
      this.islands.push(
        new Island(
          template,
          functionToEvolve,
          config.functionsPerPrompt,
          config.clusterSamplingTemperatureInit,
          config.clusterSamplingTemperaturePeriod
        )
      );
    }

    this.bestScorePerIsland = Array(this.config.numIslands).fill(
      Number.NEGATIVE_INFINITY
    );
    this.bestProgramPerIsland = Array(this.config.numIslands).fill(null);
    this.bestScoresPerTestPerIsland = Array(this.config.numIslands).fill(null);
    this.lastResetTime = Date.now();
  }

  /**
   *
   * @returns a prompt containing implementations from one chosen island.
   */
  getPrompt(): Prompt {
    const islandId = Math.floor(Math.random() * this.islands.length);
    const [code, versionGenerated] = this.islands[islandId].getPrompt();
    return new Prompt(code, versionGenerated, islandId);
  }

  /**
   * Registers `program` in the specified island.
   * @param program
   * @param islandId
   * @param scoresPerTest
   */
  private registerProgramInIsland(
    program: Function,
    islandId: number,
    scoresPerTest: ScoresPerTest
  ): void {
    this.islands[islandId].registerProgram(program, scoresPerTest);
    const score = reduceScore(scoresPerTest);

    if (score > this.bestScorePerIsland[islandId]) {
      this.bestProgramPerIsland[islandId] = program;
      this.bestScoresPerTestPerIsland[islandId] = scoresPerTest;
      this.bestScorePerIsland[islandId] = score;
      console.log(`Best score of island ${islandId} increased to ${score}`);
    }
  }

  /**
   * Registers `program` in the database.
   * @param program
   * @param islandId
   * @param scoresPerTest
   */
  registerProgram(
    program: Function,
    islandId: number | null,
    scoresPerTest: ScoresPerTest
  ): void {
    if (islandId === null) {
      for (let i = 0; i < this.islands.length; i++) {
        this.registerProgramInIsland(program, i, scoresPerTest);
      }
    } else {
      this.registerProgramInIsland(program, islandId, scoresPerTest);
    }

    if (Date.now() - this.lastResetTime > this.config.resetPeriod) {
      this.lastResetTime = Date.now();
      this.resetIslands();
    }
  }

  // Resets the weaker half of islands.
  resetIslands(): void {
    const indicesSortedByScore = Array.from(
      { length: this.bestScorePerIsland.length },
      (_, i) => i
    ).sort((a, b) => {
      // We sort best scores after adding minor noise to break ties.
      const noiseA = Math.random() * 1e-6;
      const noiseB = Math.random() * 1e-6;
      return (
        this.bestScorePerIsland[b] +
        noiseB -
        (this.bestScorePerIsland[a] + noiseA)
      );
    });

    const numIslandsToReset = Math.floor(this.config.numIslands / 2);
    const resetIslandsIds = indicesSortedByScore.slice(0, numIslandsToReset);
    const keepIslandsIds = indicesSortedByScore.slice(numIslandsToReset);

    for (const islandId of resetIslandsIds) {
      this.islands[islandId] = new Island(
        this.template,
        this.functionToEvolve,
        this.config.functionsPerPrompt,
        this.config.clusterSamplingTemperatureInit,
        this.config.clusterSamplingTemperaturePeriod
      );
      this.bestScorePerIsland[islandId] = Number.NEGATIVE_INFINITY;

      const founderIslandId =
        keepIslandsIds[Math.floor(Math.random() * keepIslandsIds.length)];
      const founder = this.bestProgramPerIsland[founderIslandId];
      const founderScores = this.bestScoresPerTestPerIsland[founderIslandId];
      this.registerProgramInIsland(founder, islandId, founderScores);
    }
  }
}
