import { expect } from "chai";
import { describe, it } from "mocha";
import { funsearch } from "./funsearch.ts"; // Import the 'funsearch' module (replace with the correct module path).

const PY_PROMPT = `
import itertools
import jax

@funsearch.run
@jax.jit
def run(n: int):
  return capset(n)

@funsearch.evolve
def capset(n: int):
  """Trivial implementation of capset.

  Args: ...
  """
  return [[1,] * n]
`;

const PY_PROMPT_EVOLVE_RUN = `
import itertools

@funsearch.run
@funsearch.evolve
def capset(n: int):
  return [[1,] * n]
`;

const PY_PROMPT_NO_RUN = `
import itertools

def run(n: int):
  return capset(n)

@funsearch.evolve
def capset(n: int):
  """Trivial implementation of capset.

  Args: ...
  """
  return [[1,] * n]
`;

const PY_PROMPT_NO_EVOLVE = `
import itertools

@funsearch.run
def run(n: int):
  return capset(n)

def capset(n: int):
  """Trivial implementation of capset.

  Args: ...
  """
  return [[1,] * n]
`;

const PY_PROMPT_DOUBLE_RUN = `
import itertools

@funsearch.run
def run(n: int):
  return capset(n)

@funsearch.run
def capset(n: int):
  """Trivial implementation of capset.

  Args: ...
  """
  return [[1,] * n]
`;

describe("Funsearch Test", () => {
  it("should extract function names", () => {
    const [toEvolve, toRun] = funsearch.extractFunctionNames(PY_PROMPT);
    expect(toRun).to.equal("run");
    expect(toEvolve).to.equal("capset");
  });

  it("should extract function names with evolve and run", () => {
    const [toEvolve, toRun] =
      funsearch.extractFunctionNames(PY_PROMPT_EVOLVE_RUN);
    expect(toRun).to.equal("capset");
    expect(toEvolve).to.equal("capset");
  });

  it("should throw error when no run function is found", () => {
    expect(() => {
      funsearch.extractFunctionNames(PY_PROMPT_NO_RUN);
    }).to.throw("Expected 1 function decorated with `@funsearch.run`.");
  });

  it("should throw error when no evolve function is found", () => {
    expect(() => {
      funsearch.extractFunctionNames(PY_PROMPT_NO_EVOLVE);
    }).to.throw("Expected 1 function decorated with `@funsearch.evolve`.");
  });

  it("should throw error when double run functions are found", () => {
    expect(() => {
      funsearch.extractFunctionNames(PY_PROMPT_DOUBLE_RUN);
    }).to.throw("Expected 1 function decorated with `@funsearch.run`.");
  });
});
