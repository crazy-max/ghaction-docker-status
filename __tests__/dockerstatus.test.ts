import {describe, expect, it, jest, test} from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import * as dockerstatus from '../src/dockerstatus';
import {Status, StatusCode, StatusOverallEntity} from '../src/dockerstatus';

describe('dockerstatus', () => {
  it('returns docker status', async () => {
    const status = await dockerstatus.status();
    expect(status?.result.status_overall).not.toEqual('');
  });
});

describe('status', () => {
  test.each([
    [
      'status.json',
      {
        updated: '2022-04-23T23:01:26.115Z',
        status: 'Operational',
        status_code: StatusCode.Operational
      } as StatusOverallEntity
    ],
    [
      'incident.json',
      {
        updated: '2021-04-03T15:25:55.730Z',
        status: 'Partial Service Disruption',
        status_code: StatusCode.PartialServiceDisruption
      } as StatusOverallEntity
    ]
  ])('given %p', async (file, expStatusOverall) => {
    jest.spyOn(dockerstatus, 'status').mockImplementation((): Promise<Status> => {
      return <Promise<Status>>(JSON.parse(
        fs.readFileSync(path.join(__dirname, 'fixtures', file), {
          encoding: 'utf8',
          flag: 'r'
        })
      ) as unknown);
    });
    const status = await dockerstatus.status();
    expect(status?.result.status_overall).toEqual(expStatusOverall);
  });
});
