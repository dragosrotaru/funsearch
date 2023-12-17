import { type Function } from "./function.ts";
import { type Program } from "./program.ts";
import { ProgramVisitor } from "./programVisitor.ts";
import { missing } from "./ast.ts";

/**
 * Returns Program object by parsing input text using AST
 */
export function textToProgram(text: string): Program {
  try {
    const tree = missing.parse(text);
    const visitor = new ProgramVisitor(text);
    visitor.visit(tree);
    return visitor.returnProgram();
  } catch (e) {
    console.warn(`Failed parsing ${text}`);
    throw e;
  }
}
/**
 * Returns Function object by parsing input text using AST
 * @param text
 * @returns
 */
export function textToFunction(text: string): Function {
  const program = textToProgram(text);
  if (program.functions.length !== 1) {
    throw new Error(
      `Only one function expected, got ${program.functions.length}:\n${program.functions}`
    );
  }
  return program.functions[0];
}

/**
 * Transforms code into tokens
 */
function* tokenize(code: string) {
  const codeBytes = missing.encode(code);
  const codeIo = missing.bytesIO(codeBytes);
  yield* missing.tokenizer(codeIo.readline);
}

/**
 * Transforms a list of tokens into code.
 * @param tokens
 * @returns
 */
function untokenize(tokens: any[]): string {
  const codeBytes = missing.untokenize(tokens);
  return codeBytes.decode();
}

/**
 * Yields each token with a bool indicating whether it is a function call
 * @param code
 */
function* yieldTokenAndIsCall(code: string) {
  try {
    const tokens = [...tokenize(code)];
    let prevToken = null;
    let isAttributeAccess = false;

    for (const token of tokens) {
      if (
        prevToken &&
        prevToken.type === missing.tokenize.NAME &&
        token.type === missing.tokenize.OP &&
        token.string === "("
      ) {
        yield [prevToken, !isAttributeAccess];
        isAttributeAccess = false;
      } else {
        if (prevToken) {
          isAttributeAccess =
            prevToken.type === missing.tokenize.OP && prevToken.string === ".";
          yield [prevToken, false];
        }
      }
      prevToken = token;
    }

    if (prevToken) {
      yield [prevToken, false];
    }
  } catch (e) {
    console.warn(`Failed parsing ${code}`);
    throw e;
  }
}

/**
 * Renames function calls
 * @param code
 * @param sourceName
 * @param targetName
 * @returns
 */
export function renameFunctionCalls(
  code: string,
  sourceName: string,
  targetName: string
): string {
  if (!code.includes(sourceName)) {
    return code;
  }

  const modifiedTokens = [];

  for (const [token, isCall] of yieldTokenAndIsCall(code)) {
    if (isCall && token.string === sourceName) {
      // Replace the function name token
      const modifiedToken = missing.TokenInfo(
        token.type,
        targetName,
        token.start,
        token.end,
        token.line
      );
      modifiedTokens.push(modifiedToken);
    } else {
      modifiedTokens.push(token);
    }
  }

  return untokenize(modifiedTokens);
}

/**
 * Returns the set of all functions called in `code`.
 * @param code
 * @returns
 */
export function getFunctionsCalled(code: string): Set<string> {
  return new Set(
    [...yieldTokenAndIsCall(code)]
      .filter(([, isCall]) => isCall)
      .map(([token]) => token.string)
  );
}

/**
 * Yields names of functions decorated with `@module.name` in `code`.
 * @param code
 * @param module
 * @param name
 */
export function* yieldDecorated(code: string, module: string, name: string) {
  const tree = missing.parse(code);
  for (const node of missing.walk(tree)) {
    if (node instanceof missing.FunctionDef) {
      for (const decorator of node.decorator_list) {
        let attribute = null;
        if (decorator instanceof missing.Attribute) {
          attribute = decorator;
        } else if (decorator instanceof missing.Call) {
          attribute = decorator.func;
        }
        if (
          attribute &&
          attribute.value.id === module &&
          attribute.attr === name
        ) {
          yield node.name;
        }
      }
    }
  }
}
