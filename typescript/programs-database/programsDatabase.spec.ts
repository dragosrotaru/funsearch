import { ProgramsDatabase, Island, softmax } from "./programsDatabase.ts"; // Import the necessary modules (replace with the correct module paths).

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

describe("ProgramsDatabase Test", () => {
  it("should create the initial prompt as expected", () => {
    const template = SKELETON;
    const functionToEvolve = "priority";
    const database = new ProgramsDatabase(template, functionToEvolve);
    const initialProgram = template;
    database.registerProgram(initialProgram, null, { unused_input: -1 });
    const expectedPrompt = EXPECTED_INITIAL_PROMPT;
    expect(database.getPrompt()).to.equal(expectedPrompt);
  });

  it("should generate the expected prompt", () => {
    const template = SKELETON;
    const functionToEvolve = "priority";
    const island = new Island(template, functionToEvolve, 2, 1.0, 30000);
    const sampleA = { ...template };
    sampleA.body = SAMPLE_A;
    const sampleB = { ...template };
    sampleB.body = SAMPLE_B;
    const generatedPrompt = island.generatePrompt([sampleA, sampleB]);
    const expectedPrompt = EXPECTED_PROMPT;
    expect(generatedPrompt).to.equal(expectedPrompt);
  });

  it("should destroy islands as expected", () => {
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
      expect(database.bestScorePerIsland[i]).to.equal(expectedScores[i]);
    });
    database.bestScorePerIsland.forEach((score, i) => {
      if (!keptIslands.includes(i)) {
        expect(score).to.be.at.least(minKept);
      }
    });
  });
});

describe("Softmax Test", () => {
  it("should compute softmax probabilities with lower temperature", () => {
    const logits = [10, 9, -1000];
    const temperature = 1.0;
    const probabilities = softmax(logits, temperature);
    expect(probabilities).to.deep.equal([0.6590012, 0.242433, 0.0985659]);
  });

  it("should compute softmax probabilities with higher temperature", () => {
    const logits = [10, 9, -1000];
    const temperature = 2.0;
    const probabilities = softmax(logits, temperature);
    expect(probabilities).to.deep.equal([0.50168777, 0.304289, 0.19402324]);
  });
});
