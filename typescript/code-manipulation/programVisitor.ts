import { Program } from "./program.ts";
import { type Function } from "./function.ts";
import { type AST } from "./ast.ts";

/**
 * Parses code to collect all required information to produce a `Program`.
 */
export class ProgramVisitor {
  private functions: Function[] = [];
  private preface: AST | null = null;
  public currentFunction: Function | null = null;

  constructor(private code: AST) {}

  /** Collects all information about the function being parsed. **/
  public visit(node: Function): void {
    if (!node.isTopLevel()) return;

    this.currentFunction = node;

    // Set Prefac
    // todo
    this.preface;

    // Append Function
    this.functions.push(node);

    // Generic Visit
    // todo (this class inherits ast.NodeVisitor)
  }

  public returnProgram(): Program {
    return new Program(this.preface, this.functions);
  }
}
