import { trim } from '../src/common/utils';

describe("Utils", function() {
  it("check trim.", function() {
    assert.equal(trim("aavaa", "a"), "v");
    assert.equal(trim("aav", "a"), "v");
    assert.equal(trim("v", "a"), "v");
    assert.equal(trim("vaa", "a"), "v");
  });
});