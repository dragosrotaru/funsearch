import { Evaluator } from "./evaluator/evaluator.ts";
import { LLM } from "./llm.ts";
import { ProgramsDatabase } from "./programs-database/programsDatabase.ts";

export class Sampler {
  private llm: LLM;

  constructor(
    private database: ProgramsDatabase,
    private evaluators: Evaluator[],
    samplesPerPrompt: number
  ) {
    this.llm = new LLM(samplesPerPrompt);
  }

  sample(): void {
    while (true) {
      const prompt = this.database.getPrompt();
      const samples = this.llm.drawSamples(prompt.code);
      for (const sample of samples) {
        const chosenEvaluator =
          this.evaluators[Math.floor(Math.random() * this.evaluators.length)];
        chosenEvaluator.analyse(
          sample,
          prompt.islandId,
          prompt.versionGenerated
        );
      }
    }
  }
}
