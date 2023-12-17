import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.209.0/assert/mod.ts";
import { ProgramsDatabase } from "./programsDatabase.ts";
import { Island } from "./island.ts";
import { softmax } from "./math.ts";

const SKELETON = `
/**Finds large cap sets.*/
import numpy as np
import utils_capset

function evaluate(n: number): number {
  /**Returns the size of an n-dimensional cap set.*/
  const capset = solve(n);
  return capset.length;
}

function priority(element: number, n: number): number {
  /**Returns the priority with which we want to add element to the cap set.*/
  return 0.0;
}
`;

const EXPECTED_INITIAL_PROMPT = `
/**Finds large cap sets.*/
import numpy as np
import utils_capset

function priority_v0(element: number, n: number): number {
  /**Returns the priority with which we want to add element to the cap set.*/
  return 0.0;
}

function priority_v1(element: number, n: number): number {
  /**Improved version of priority_v0.*/
}
`;

const SAMPLE_A = `
  const priority = element;
  /***
   * Code from lowest-scoring sampled program.
   ***/
  return ...
`;

const SAMPLE_B = `
  const priority = Math.pow(element, 2);
  /***
   * Code from highest-scoring sampled program.
   ***/
  return ...
`;

const EXPECTED_PROMPT = `
/**Finds large cap sets.*/
import numpy as np
import utils_capset

function priority_v0(element: number, n: number): number {
  /**Returns the priority with which we want to add element to the cap set.*/
  const priority = element;
  /***
   * Code from lowest-scoring sampled program.
   ***/
  return ...
}

function priority_v1(element: number, n: number): number {
  /**Improved version of priority_v0.*/
  const priority = Math.pow(element, 2);
  /***
   * Code from highest-scoring sampled program.
   ***/
  return ...
}

function priority_v2(element: number, n: number): number {
  /**Improved version of priority_v1.*/
}
`;

Deno.test("ProgramsDatabase - Initial Prompt", () => {
  const template = SKELETON;
  const functionToEvolve = "priority";
  const database = new ProgramsDatabase(template, functionToEvolve);
  const initialProgram = template;
  database.registerProgram(initialProgram, null, { unused_input: -1 });
  const expectedPrompt = EXPECTED_INITIAL_PROMPT;
  assertEquals(database.getPrompt(), expectedPrompt);
});

Deno.test("Island - Generate Prompt", () => {
  const template = SKELETON;
  const functionToEvolve = "priority";
  const island = new Island(template, functionToEvolve, 2, 1.0, 30000);
  const sampleA = { ...template };
  sampleA.body = SAMPLE_A;
  const sampleB = { ...template };
  sampleB.body = SAMPLE_B;
  const generatedPrompt = island.generatePrompt([sampleA, sampleB]);
  const expectedPrompt = EXPECTED_PROMPT;
  assertEquals(generatedPrompt, expectedPrompt);
});

Deno.test("ProgramsDatabase - Destroy Islands", () => {
  const template = SKELETON;
  const functionToEvolve = "priority";
  const database = new ProgramsDatabase(template, functionToEvolve, 10);
  const scores = [7, 3, 5, 6, 7, -2, 0, -1, 4, 3];
  const unusedFunction = template;
  scores.forEach((score, i) => {
    database.registerProgram(unusedFunction, i, { unused_input: score });
  });
  database.registerProgram(unusedFunction, 7, { unused_input: 17 });

  const expectedScores = [...scores];
  expectedScores[7] = 17;
  const minKept = Math.min(...expectedScores.filter((_, i) => i !== 7));
  const keptIslands = [0, 2, 3, 4, 7];
  database.resetIslands();
  keptIslands.forEach((i) => {
    assertEquals(database.bestScorePerIsland[i], expectedScores[i]);
  });
  database.bestScorePerIsland.forEach((score, i) => {
    if (!keptIslands.includes(i)) {
      assert(score >= minKept);
    }
  });
});

Deno.test("Softmax - Lower Temperature", () => {
  const logits = [10, 9, -1000];
  const temperature = 1.0;
  const probabilities = softmax(logits, temperature);
  assertEquals(
    probabilities,
    [0.6590012, 0.242433, 0.0985659],
    "Softmax probabilities mismatch"
  );
});

Deno.test("Softmax - Higher Temperature", () => {
  const logits = [10, 9, -1000];
  const temperature = 2.0;
  const probabilities = softmax(logits, temperature);
  assertEquals(
    probabilities,
    [0.50168777, 0.304289, 0.19402324],
    "Softmax probabilities mismatch"
  );
});
