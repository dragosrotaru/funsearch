import { type Function } from "./function.ts";

/**
 * A parsed program
 */
export class Program {
  /**
   *
   * @param preface everything from the beginning of the code till the first function is found
   * @param functions
   */
  constructor(private preface: string, public functions: Function[]) {}

  public toString(): string {
    return `${this.preface}
    ${this.functions.map((f) => f.toString()).join("\n")}
    `;
  }

  public getFunction(functionName: string): Function {
    const index = this.findFunctionIndex(functionName);
    return this.functions[index];
  }

  /**
   *
   * @param functionName
   * @returns {string} the index of function name
   */
  private findFunctionIndex(functionName: string): number {
    const functionNames = this.functions.map((f) => f.name);
    const count = functionNames.filter((name) => name === functionName).length;
    if (count === 0) {
      throw new Error(
        `Function ${functionName} does not exist in program:\n${this}`
      );
    }
    if (count > 1) {
      throw new Error(
        `Function ${functionName} exists more than once in program:\n${this}`
      );
    }
    return functionNames.indexOf(functionName);
  }
}
