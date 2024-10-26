import * as httpm from '@actions/http-client';

export enum StateCode {
  Investigating = 100,
  MajorIdentified = 200,
  CriticalMonitoring = 300
}

export enum StatusCode {
  Operational = 100,
  DegradedPerformance = 300,
  PartialServiceDisruption = 400,
  ServiceDisruption = 500,
  SecurityEvent = 600
}

export interface Status {
  result: ResultEntity;
}

export interface ResultEntity {
  status_overall: StatusOverallEntity;
  status: StatusEntity[];
  incidents?: IncidentsEntity[];
  maintenance?: MaintenanceEntity;
}

export interface StatusOverallEntity {
  updated: string;
  status: string;
  status_code: StatusCode;
}

export interface StatusEntity {
  id: string;
  name: string;
  updated: string;
  status: string;
  status_code: StatusCode;
  containers: ContainersEntity;
}

export interface ContainersEntity {
  id: string;
  name: string;
  updated: string;
  status: string;
  status_code: StatusCode;
}

export interface IncidentsEntity {
  _id: string;
  name: string;
  datetime_open: string;
  status: string;
  status_code: StatusCode;
  messages?: MessagesEntity[] | null;
  components_affected?: ComponentsAffectedEntity[] | null;
  containers_affected?: ContainersAffectedEntity[] | null;
}

export interface MaintenanceEntity {
  active?: MaintenanceActiveEntity[] | null;
  upcoming?: MaintenanceUpcomingEntity[] | null;
}

export interface MaintenanceActiveEntity {
  id: string;
  name: string;
  datetime_open: string;
  datetime_planned_start: string;
  datetime_planned_end: string;
  messages?: MessagesEntity[] | null;
  components_affected?: ComponentsAffectedEntity[] | null;
  containers_affected?: ContainersAffectedEntity[] | null;
}

export interface MaintenanceUpcomingEntity {
  id: string;
  name: string;
  datetime_open: string;
  datetime_planned_start: string;
  datetime_planned_end: string;
  messages?: MessagesEntity[] | null;
  components_affected?: ComponentsAffectedEntity[] | null;
  containers_affected?: ContainersAffectedEntity[] | null;
}

export interface MessagesEntity {
  details: string;
  datetime: string;
  state: StateCode;
  status: StatusCode;
}

export interface ComponentsAffectedEntity {
  _id: string;
  name: string;
}

export interface ContainersAffectedEntity {
  _id: string;
  name: string;
}

export enum Component {
  DockerHubRegistry = '5342d1b837768a325c00000b',
  DockerAuthentication = '61e1a6108e1cce053fe15fa8',
  DockerHubWeb = '533c6539221ae15e3f000040',
  DockerDesktop = '636bddd6d7327366cd233ff0',
  DockerBilling = '64513ac721e02f053d0ad4b0',
  DockerPackageRepositories = '582c71aa40855b4d0e000240',
  DockerHubAutomatedBuilds = '5342bc9420974b775d000008',
  DockerHubSecurityScanning = '61bb4045682d750536ef4488',
  DockerDocs = '5347131d545b2f12640000bc',
  DockerCommunityForums = '55b15ea10a54eb8c71000ebf',
  DockerSupport = '57f296dbe1401094660008e1',
  DockerWebsite = '53a1c83e814a437c5a00075a',
  DockerScout = '6513f7ae436354053158aa06',
  DockerBuildCloud = '659436deec9260052dcd9647'
}

export const StateNames = new Map<string, StateCode>([
  ['investigating', StateCode.Investigating],
  ['major_identified', StateCode.MajorIdentified],
  ['critical_monitoring', StateCode.CriticalMonitoring]
]);

export const StatusNames = new Map<string, StatusCode>([
  ['operational', StatusCode.Operational],
  ['degraded_performance', StatusCode.DegradedPerformance],
  ['partial_service_disruption', StatusCode.PartialServiceDisruption],
  ['service_disruption', StatusCode.ServiceDisruption],
  ['security_event', StatusCode.SecurityEvent]
]);

export const getStatesName = (stateCode: StateCode): string | undefined => {
  for (const [key, val] of StateNames) {
    if (val == stateCode) return key;
  }
};

export const getStatusName = (statusCode: StatusCode): string | undefined => {
  for (const [key, val] of StatusNames) {
    if (val == statusCode) return key;
  }
};

export const status = async (): Promise<Status | null> => {
  const http: httpm.HttpClient = new httpm.HttpClient('ghaction-docker-status');
  return (await http.getJson<Status>(`https://api.status.io/1.0/status/533c6539221ae15e3f000031`)).result;
};
