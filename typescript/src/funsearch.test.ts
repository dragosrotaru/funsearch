import {
  assertThrows,
  assertEquals,
} from "https://deno.land/std@0.209.0/assert/mod.ts";
import { extractFunctionNames } from "./funsearch.ts"; // Import the 'funsearch' module (replace with the correct module path).

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

Deno.test("Funsearch - Extract Function Names", () => {
  const [toEvolve, toRun] = extractFunctionNames(PY_PROMPT);
  assertEquals(toRun, "run");
  assertEquals(toEvolve, "capset");
});

Deno.test("Funsearch - Extract Function Names with Evolve and Run", () => {
  const [toEvolve, toRun] = extractFunctionNames(PY_PROMPT_EVOLVE_RUN);
  assertEquals(toRun, "capset");
  assertEquals(toEvolve, "capset");
});

Deno.test("Funsearch - Throw Error When No Run Function is Found", () => {
  assertThrows(
    () => {
      extractFunctionNames(PY_PROMPT_NO_RUN);
    },
    Error,
    "Expected 1 function decorated with `@funsearch.run`."
  );
});

Deno.test("Funsearch - Throw Error When No Evolve Function is Found", () => {
  assertThrows(
    () => {
      extractFunctionNames(PY_PROMPT_NO_EVOLVE);
    },
    Error,
    "Expected 1 function decorated with `@funsearch.evolve`."
  );
});

Deno.test("Funsearch - Throw Error When Double Run Functions are Found", () => {
  assertThrows(
    () => {
      extractFunctionNames(PY_PROMPT_DOUBLE_RUN);
    },
    Error,
    "Expected 1 function decorated with `@funsearch.run`."
  );
});
