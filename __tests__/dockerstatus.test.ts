import * as path from 'path';
import * as dockerstatus from '../src/dockerstatus';
import {Status, StatusCode, StatusOverallEntity} from '../src/dockerstatus';

describe('dockerstatus', () => {
  it('returns docker status', async () => {
    const status = await dockerstatus.status();
    console.log(JSON.stringify(status, null, 2));
    expect(status?.result.status_overall).not.toEqual('');
  });
});

describe('status', () => {
  test.each([
    [
      'status.json',
      {
        updated: '2021-02-05T06:41:14.332Z',
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
    jest.spyOn(dockerstatus, 'status').mockImplementation(
      (): Promise<Status> => {
        return <Promise<Status>>require(path.join(__dirname, 'fixtures', file));
      }
    );

    const status = await dockerstatus.status();
    console.log(JSON.stringify(status, null, 2));
    expect(status?.result.status_overall).toEqual(expStatusOverall);
  });
});
