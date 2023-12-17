import { assertEquals } from "https://deno.land/std@0.209.0/assert/mod.ts";
import { textToFunction } from "./parser.ts";
import { textToProgram } from "./parser.ts";
import { Function } from "./function.ts";

const _IMPORTS = `\
import itertools;
import numpy;
`;

const _CLASS = `\
class Helper {
  constructor(n: number) {
    this.n = n;
    this.initial_capset = get_capset_v0(n);
  }
}
`;

const _ASSIGNMENT = `\
const some_global_variable = 0;
`;

const _FUNCTIONS = `\
/**
 * Computes a cap set for n number of copies.
 * A cap set is a subset of an n-dimensional affine space over a three-element
 * field with no three elements in a line.
 * @param n - an integer, number of copies.
 * @returns A set of tuples in {0, 1, 2}.
 */
function get_capset_v0(n: number): Set<number[]> {
  const capset = new Set<number[]>();
  for (let i = 0; i < n; i++) {
    capset.add(Array(i).fill(0).concat([1], Array(n - i - 1).fill(0)));
  }
  return capset;
}

// One line Doc String
function get_capset_v2(k: number) {
  const get_capset_v0 = get_capset_v0(k);
  return get_capset_v0;
}
`;

const _SMALL_PROGRAM = `\
function test(): number[] {
  return [0];
}
`;

const _FUNCTION_HEADER = "function get_capset_v0(n: number)";
const _FUNCTION_RETURN_TYPE = ": Set<number[]>";
const _FUNCTION_DOCSTRING = `/** One line docstring. */`;
const _FUNCTION_BODY = `{
  const capset = new Set<number[]>();
  for (let i = 0; i < n; i++) {
    capset.add(Array(i).fill(0).concat([1], Array(n - i - 1).fill(0)));
  }
  return capset;
}
`;

function createTestFunction(
  hasReturnType: boolean,
  hasDocstring: boolean
): string {
  let code = _FUNCTION_HEADER;
  if (hasReturnType) {
    code += _FUNCTION_RETURN_TYPE;
  }
  code += " ";
  code += "{\n";
  if (hasDocstring) {
    code += _FUNCTION_DOCSTRING;
    code += "\n";
  }
  code += _FUNCTION_BODY;
  return code;
}

function createTestProgram(
  hasImports: boolean,
  hasClass: boolean,
  hasAssignment: boolean
): string {
  let code = "";
  if (hasImports) {
    code += _IMPORTS;
  }
  if (hasClass) {
    code += _CLASS;
  }
  if (hasAssignment) {
    code += _ASSIGNMENT;
  }
  code += _FUNCTIONS;
  return code;
}

Deno.test("PromptSamplingTest", () => {
  Deno.test("test_text_to_function", () => {
    const hasReturnType = true;
    const hasDocstring = true;
    const code = createTestFunction(hasReturnType, hasDocstring);
    const func = textToFunction(code);

    assertEquals(func.name, "get_capset_v0");
    assertEquals(func.args, "n: number");
    assertEquals(func.returnType, "Set<number[]>");
    assertEquals(func.docstring, "One line docstring.");
    assertEquals(
      func.body,
      `{
  const capset = new Set<number[]>();
  for (let i = 0; i < n; i++) {
    capset.add(Array(i).fill(0).concat([1], Array(n - i - 1).fill(0)));
  }
  return capset;
}`
    );
  });

  Deno.test("test_small_text_to_program", () => {
    const code = _SMALL_PROGRAM;
    const program = textToProgram(code);

    assertEquals(program.preface, "");
    assertEquals(program.functions.length, 1);

    const expectedFunction = new Function(
      "test",
      "",
      "number[]",
      `return [0];`
    );

    assertEquals(program.functions[0], expectedFunction);
    assertEquals(code + "\n", program.toString());
  });

  Deno.test("test_text_to_program", () => {
    const hasImports = true;
    const hasClass = true;
    const hasAssignment = true;
    const code = createTestProgram(hasImports, hasClass, hasAssignment);
    const program = textToProgram(code);

    assertEquals(program.preface, _IMPORTS);
    assertEquals(program.functions.length, 2);

    const expectedFunction0 = new Function(
      "get_capset_v0",
      "n: number",
      "Set<number[]>",
      `/**
 * Computes a cap set for n number of copies.
 * A cap set is a subset of an n-dimensional affine space over a three-element
 * field with no three elements in a line.
 * @param n - an integer, number of copies.
 * @returns A set of tuples in {0, 1, 2}.
 */
{
  const capset = new Set<number[]>();
  for (let i = 0; i < n; i++) {
    capset.add(Array(i).fill(0).concat([1], Array(n - i - 1).fill(0)));
  }
  return capset;
}`
    );

    const expectedFunction1 = new Function(
      "get_capset_v2",
      "",
      "k: number",
      undefined,
      `{
  const get_capset_v0 = get_capset_v0(k);
  return get_capset_v0;
}`
    );

    assertEquals(program.functions[0], expectedFunction0);
    assertEquals(program.functions[1], expectedFunction1);
  });

  Deno.test("test_get_functions_called", () => {
    const code = `\
      function f(n: number): number {
        if (n === 1) {
          return a(n);
        } else if (n === 2) {
          return b(n) + object.c(n - 1);
        }
        const a = object.property;
        g();
        return f(n - 1);
      }`;

    const calledFunctions = getFunctionsCalled(code);
    const expectedFunctions = new Set(["a", "b", "object.c", "g"]);

    assertEquals(calledFunctions, expectedFunctions);
  });
});
