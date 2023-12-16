import { Evaluator } from "./evaluator/evaluator.ts";
import { Sampler } from "./sampler.ts";
import { ProgramsDatabase } from "./programs-database/programsDatabase.ts";
import { CONFIG } from "./config.ts";
import { textToProgram, yieldDecorated } from "./code-manipulation/parser.ts";

/**
 * Returns the name of the function to evolve and of the function to run.
 * @param specification
 * @returns
 */
function extractFunctionNames(specification: string): [string, string] {
  const runFunctions = [...yieldDecorated(specification, "funsearch", "run")];

  if (runFunctions.length !== 1) {
    throw new Error("Expected 1 function decorated with `@funsearch.run`.");
  }

  const evolveFunctions = [
    ...yieldDecorated(specification, "funsearch", "evolve"),
  ];

  if (evolveFunctions.length !== 1) {
    throw new Error("Expected 1 function decorated with `@funsearch.evolve`.");
  }

  return [evolveFunctions[0], runFunctions[0]];
}
/**
 * Launches a FunSearch experiment
 * @param specification
 * @param inputs
 */
export function funsearch(specification: string, inputs: any[]): void {
  const [functionToEvolve, functionToRun] = extractFunctionNames(specification);

  const template = textToProgram(specification);
  const database = new ProgramsDatabase(template, functionToEvolve);

  const evaluators: Evaluator[] = [];
  for (let i = 0; i < CONFIG.numEvaluators; i++) {
    evaluators.push(
      new Evaluator(database, template, functionToEvolve, functionToRun, inputs)
    );
  }

  // Send the initial implementation to be analyzed by one of the evaluators.
  const initial = template.getFunction(functionToEvolve).body;
  evaluators[0].analyse(initial, null, null);

  const samplers: Sampler[] = [];
  for (let i = 0; i < CONFIG.numSamplers; i++) {
    samplers.push(new Sampler(database, evaluators, CONFIG.samplesPerPrompt));
  }

  // This loop can be executed in parallel on remote sampler machines.
  for (const s of samplers) {
    s.sample();
  }
}
