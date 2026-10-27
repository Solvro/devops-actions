import { test } from "node:test";
import assert from "node:assert/strict";
import { addition } from "./main.ts";

test("simple test", () => {
  assert.equal(addition(2, 3), 5);
});
