import * as React from 'react';
import { trim } from '../src/common/utils';
import { AsyncLoader } from '../src/loader/asyncLoader';
import { wait } from '../src/store/internals/entityStore';
import { Queue } from '../src/common/queue';
import { BadgePanel } from '../src/badgePanel/badgePanel';
import { renderTestElement } from '../testRunner/utils/testHelper';
import { merge } from '../src/animation/amim';
import * as assert from 'assert';

describe("Utils", function() {
  it("check trim.", function() {
    assert.equal(trim("aavaa", "a"), "v");
    assert.equal(trim("aav", "a"), "v");
    assert.equal(trim("v", "a"), "v");
    assert.equal(trim("vaa", "a"), "v");
  });

  it("check badge panel.", async function() {
    let b = new BadgePanel();
    renderTestElement(b.render({children:<div style={{'height':'300px'}}>Some content</div>}));
    await wait(1000);
    console.log("load...");
     await b.addLoading(wait(2000));
    await b.addMessage("SAVED",wait(2000));
    await b.addLoading(wait(2000));
    await b.addMessage("SAVED",wait(2000));
     console.log("load #2...");
     console.log("finished...");

  });

});