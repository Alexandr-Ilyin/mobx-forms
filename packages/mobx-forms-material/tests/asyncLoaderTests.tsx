import { renderTestElement } from '../testRunner/utils/testHelper';
import { AsyncLoader } from '../src/loader/asyncLoader';
import { wait } from '../src/store/internals/entityStore';

describe("Async loader ", function() {

  it("should show loading.", function() {
    let asyncLoader = new AsyncLoader();
    asyncLoader.wait(()=>wait(1000));
    renderTestElement(asyncLoader.render(<div>Some content</div>));
  })
});