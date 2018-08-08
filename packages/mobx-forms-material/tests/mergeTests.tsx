import { merge } from '../src/animation/amim';
import * as assert from "assert";

describe("Merge", function() {
  it("check merge 1.", async function() {
    let merged = merge(
      [{ key: 'A' }, { key: 'B' }, { key: 'C' }],
      [{ key: 'B' }, { key: 'X' }]
    );
    assert.deepStrictEqual(merged.map(x => x.key), ['A', 'B', 'C', 'X']);
  });
  it("check merge 2.", async function() {
    let merged = merge(
      [{ key: 'A' }, { key: 'B' }],
      [{ key: 'C' }, { key: 'D' }]
    );
    assert.deepStrictEqual(merged.map(x => x.key), ['A', 'B', 'C', 'D']);
  });

  it("check-merge-3.", async function() {
    let merged = merge(
      [{ key: 'B' }, { key: 'X' }],
      [{ key: 'A' }, { key: 'B' }, { key: 'C' }],
    );
    assert.deepStrictEqual(merged.map(x => x.key), ['A', 'B', 'X', 'C']);
  });

  it("check merge 4.", async function() {
    let merged = merge(
      [{ key: 'B' }, { key: 'C' }],
      [{ key: 'B' }, { key: 'D' }],
    );
    assert.deepStrictEqual(merged.map(x => x.key), ['B', 'C', 'D']);
  });
  it("check merge 5.", async function() {
    let merged = merge(
      [{ key: 'B' }, { key: 'C' }],
      [],
    );
    assert.deepStrictEqual(merged.map(x => x.key), ['B', 'C']);
  });
  it("check merge 6.", async function() {
    let merged = merge(
      [],
      [{ key: 'B' }, { key: 'C' }],
    );
    assert.deepStrictEqual(merged.map(x => x.key), ['B', 'C']);
  });

  it("check merge 7.", async function() {
    let merged = merge(
      [],
      [{ key: 'B' }],
    );
    assert.deepStrictEqual(merged.map(x => x.key), ['B']);
  });
  it("check merge 8.", async function() {
    let merged = merge(
      [{ key: 'B' }],
      [],
    );
    assert.deepStrictEqual(merged.map(x => x.key), ['B']);
  });
  it("check merge 9.", async function() {
    let merged = merge(
      [{ key: 'B' }],
      [{ key: 'B' }]
    );
    assert.deepStrictEqual(merged.map(x => x.key), ['B']);
  });
  it("check merge 10.", async function() {
    let removed = [];
    let merged = merge(
      [{ key: 'B' }],
      [{ key: 'B' }],(x)=>{removed.push(x.key)}
    );
    assert.deepStrictEqual(removed, []);
    assert.deepStrictEqual(merged.map(x => x.key), ['B']);
  });
});