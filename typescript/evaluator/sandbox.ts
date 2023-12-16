/**
 * Sandbox for executing generated code.
 */
export class Sandbox {
  run(
    program: string,
    functionToRun: string,
    testInput: string,
    timeoutSeconds: number
  ): [any, boolean] {
    throw new Error("Must provide a sandbox for executing untrusted code.");
  }
}
