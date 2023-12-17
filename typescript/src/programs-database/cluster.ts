import { Function } from "../code-manipulation/function.ts";
import { softmax, getRandomWeightedIndex } from "./math.ts";

/**
 * A cluster of programs on the same island and with the same Signature.
 */
export class Cluster {
  private programs: Function[];
  private lengths: number[];

  constructor(public score: number, implementation: Function) {
    this.programs = [implementation];
    this.lengths = [implementation.length];
  }

  private get normalizedLengths() {
    const minLength = Math.min(...this.lengths);
    const maxLength = Math.max(...this.lengths) + 1e-6;
    return this.lengths.map((length) => (length - minLength) / maxLength);
  }

  /**
   * Adds `program` to the cluster.
   * @param program
   */
  public registerProgram(program: Function): void {
    this.programs.push(program);
    this.lengths.push(program.length);
  }

  /**
   * Samples a program, giving higher probability to shorther programs.
   * @returns
   */
  public sampleProgram(): Function {
    const { normalizedLengths } = this;

    const probabilities = softmax(normalizedLengths, 1.0);
    const index = getRandomWeightedIndex(probabilities);
    return this.programs[index];
  }
}
