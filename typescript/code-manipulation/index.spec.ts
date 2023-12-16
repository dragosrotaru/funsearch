// Copyright 2023 DeepMind Technologies Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ==============================================================================

// Imports
import * as itertools from "itertools";
import * as textwrap from "textwrap";

// Class
class Helper {
  n: number;

  constructor(n: number) {
    this.n = n;
    this.initial_capset = get_capset_v0(n);
  }
}

// Global variable
let some_global_variable = 0;

// Functions
function get_capset_v0(n: number): Set<number[]> {
  /**
   * Computes a cap set for n number of copies.
   *
   * A cap set is a subset of an n-dimensional affine space over a three-element
   * field with no three elements in a line.
   *
   * @param n - An integer, number of copies.
   * @returns A set of tuples in [0, 1, 2].
   */
  const capset = new Set<number[]>();
  for (let i = 0; i < n; i++) {
    capset.add(
      Array(i)
        .fill(0)
        .concat(1, Array(n - i - 1).fill(0))
    );
  }
  return capset;
}

function get_capset_v2(k: number): Set<number[]> {
  /* One line docstring. */
  const get_capset_v0 = get_capset_v0(k);
  return get_capset_v0;
}

function test(): number[] {
  return new Array(1).fill(0);
}

// Test cases
function test_text_to_function(
  has_return_type: boolean,
  has_docstring: boolean
): void {
  const functionCode = createTestFunction(has_return_type, has_docstring);
  // You can parse the function code here and perform assertions.
}

function test_small_text_to_program(): void {
  const programCode = createTestProgram(false, false, false);
  // You can parse the program code here and perform assertions.
}

function test_text_to_program(
  has_imports: boolean,
  has_class: boolean,
  has_assignment: boolean
): void {
  const programCode = createTestProgram(has_imports, has_class, has_assignment);
  // You can parse the program code here and perform assertions.
}

function get_functions_called(code: string): Set<string> {
  const calledFunctions = new Set<string>();
  // You can implement code analysis to find called functions here.
  return calledFunctions;
}

function createTestFunction(
  hasReturnType: boolean,
  hasDocstring: boolean
): string {
  let code = "function get_capset_v0(n: number)";
  if (hasReturnType) {
    code += ": Set<number[]>";
  }
  code += " {\n";
  if (hasDocstring) {
    code += "  /**\n";
    code += "   * One line docstring.\n";
    code += "   */\n";
  }
  code += "  const capset = new Set<number[]>();\n";
  code += "  for (let i = 0; i < n; i++) {\n";
  code +=
    "    capset.add(Array(i).fill(0).concat(1, Array(n - i - 1).fill(0)));\n";
  code += "  }\n";
  code += "  return capset;\n";
  code += "}\n";
  return code;
}

function createTestProgram(
  hasImports: boolean,
  hasClass: boolean,
  hasAssignment: boolean
): string {
  let code = "";
  if (hasImports) {
    code += "// Imports\n";
    code += "import * as itertools from 'itertools';\n";
    code += "import * as textwrap from 'textwrap';\n";
  }
  if (hasClass) {
    code += "\n";
    code += "// Class\n";
    code += "class Helper {\n";
    code += "  n: number;\n";
    code += "\n";
    code += "  constructor(n: number) {\n";
    code += "    this.n = n;\n";
    code += "    this.initial_capset = get_capset_v0(n);\n";
    code += "  }\n";
    code += "}\n";
  }
  if (hasAssignment) {
    code += "\n";
    code += "// Global variable\n";
    code += "let some_global_variable = 0;\n";
  }
  code += "\n";
  code += "// Functions\n";
  code += "function get_capset_v0(n: number): Set<number[]> {\n";
  code += "  const capset = new Set<number[]>();\n";
  code += "  for (let i = 0; i < n; i++) {\n";
  code +=
    "    capset.add(Array(i).fill(0).concat(1, Array(n - i - 1).fill(0)));\n";
  code += "  }\n";
  code += "  return capset;\n";
  code += "}\n";
  code += "\n";
  code += "function get_capset_v2(k: number): Set<number[]> {\n";
  code += "  const get_capset_v0 = get_capset_v0(k);\n";
  code += "  return get_capset_v0;\n";
  code += "}\n";
  code += "\n";
  code += "function test(): number[] {\n";
  code += "  return new Array(1).fill(0);\n";
  code += "}\n";
  return code;
}

// Test cases
const hasReturnType = true;
const hasDocstring = true;
test_text_to_function(hasReturnType, hasDocstring);

const hasImports = true;
const hasClass = true;
const hasAssignment = true;
test_text_to_program(hasImports, hasClass, hasAssignment);

const codeToAnalyze = ""; // Insert Python code here
const calledFunctions = get_functions_called(codeToAnalyze);
