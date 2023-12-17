/**
 * Parsed Function
 */
export class Function {
  constructor(
    public name: string,
    public args: string,
    public body: string,
    public returnType: string,
    public docString: string
  ) {}

  toString(): string {
    throw new Error(
      "Function needs to be reimplemented to make sense in TypeScript/Lisp"
    );
  }
  get length(): number {
    return this.toString().length;
  }
  isTopLevel(): boolean {
    // todo
    throw new Error("needs implementation");
  }
}
