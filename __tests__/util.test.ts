import {describe, expect, it} from '@jest/globals';
import * as dockerstatus from '../src/dockerstatus';
import * as util from '../src/util';

describe('util', () => {
  it('returns docker status components', async () => {
    const status = await dockerstatus.status();
    await util.asyncForEach(status?.result.status, async component => {
      expect(component?.name).not.toEqual('');
    });
  });
});
