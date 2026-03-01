import {describe, expect, it} from 'vitest';

import * as dockerstatus from '../src/dockerstatus.js';
import * as util from '../src/util.js';

describe('util', () => {
  it('returns docker status components', async () => {
    const status = await dockerstatus.status();
    await util.asyncForEach(status?.result.status, async component => {
      expect(component?.name).not.toEqual('');
    });
  });
});
