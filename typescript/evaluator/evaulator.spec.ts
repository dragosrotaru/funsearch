import * as textwrap from "textwrap";

import { absltest, parameterized } from "absl/testing";
import * as evaluator from "./evaluator.ts"; // Import the evaluator module (replace with the correct module path).

class EvaluatorTest extends parameterized.TestCase {
  test_trim_function_body_docstring() {
    const code = `
  x = 1

  return 0
"""Docstring"""`;
    const desired = `
  x = 1

  return 0

`;
    const actual = evaluator.trimFunctionBody(code);
    this.assertEqual(desired, actual);
  }

  test_trim_function_body_function() {
    const code = `
  return 0
def new_f():`;
    const desired = `
  return 0

`;
    const actual = evaluator.trimFunctionBody(code);
    this.assertEqual(desired, actual);
  }

  test_trim_function_body_empty() {
    const code = `  return 0\n`;
    const desired = `  return 0\n\n`;
    const actual = evaluator.trimFunctionBody(code);
    this.assertEqual(desired, actual);
  }

  test_trim_function_indentation_corner_case() {
    const code = textwrap.dedent(
      `
        return (1 +
      2)
      def unfinished_code(
      `
    );
    const desired = textwrap.dedent(
      `
        return (1 +
      2)

      `
    );
    const actual = evaluator.trimFunctionBody(code);
    this.assertEqual(desired, actual);
  }

  test_trim_function_backlash_corner_case() {
    const code = textwrap.dedent(
      `
        return score + ((el[0] + 1) * (el[0] + 2) * el[1] / 6 == el[2])\\
     + ((el[0] + 1) * (el[0] + 2) * (el[0] + 3) * el[1] / 24 == el[2])\\
     + ((el[0] + 1) * (el[0] + 2) * el[1] * el[2] / 6 == n)\\
     + ((el[0] + 1) * (el[0] + 2) * el[1] * el[2] / 3 == n + el[0])\\

      `
    );
    const actual = evaluator.trimFunctionBody(code);
    this.assertEqual(actual, code);
  }
}

if (require.main === module) {
  absltest.main();
}
