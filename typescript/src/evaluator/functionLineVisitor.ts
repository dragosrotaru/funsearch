// todo this entire thing is worthless, if you have homoiconicity you dont need endline nonesense
/**
 * Visitor that finds the last line number of a function with a given name.
 */
export class FunctionLineVisitor {
  private functionEndLine: number | null = null;

  constructor(private targetFunctionName: string) {}

  /**
   * Collects the end line number of the target function.
   * @param node
   */
  visit(node: any): void {
    if (node.name === this.targetFunctionName) {
      this.functionEndLine = node.end_lineno;
    }

    // todo (this class inherits ast.NodeVisitor)
    // this.genericVisit(node);
  }

  /**
   * Line number of the final line of function `target_function_name`
   */
  get endLine(): number {
    if (this.functionEndLine === null) {
      throw new Error("Function end line is not set.");
    }
    return this.functionEndLine;
  }
}
