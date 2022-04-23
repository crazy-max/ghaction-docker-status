process.env.FORCE_COLOR = '2';

import chalk from 'chalk';
import * as core from '@actions/core';
import * as dockerstatus from './dockerstatus';
import {Component, getStatusName, Status, StatusCode, StatusNames} from './dockerstatus';
import * as utilm from './util';

const unhealthy: Array<string> = [];

async function run() {
  try {
    const status: Status | null = await dockerstatus.status();
    if (status == null) {
      core.setFailed(`Unable to contact Docker status API at this time.`);
      return;
    }

    const overallThreshold: StatusCode | undefined = await getStatus('overall_threshold');
    const componentsThreshold = new Map<Component, StatusCode | undefined>([
      [Component.DockerPackageRepositories, await getStatus('package_repositories_threshold')],
      [Component.DockerAuthentication, await getStatus('authentication_threshold')],
      [Component.DockerHubWeb, await getStatus('hub_web_threshold')],
      [Component.DockerHubRegistry, await getStatus('hub_registry_threshold')],
      [Component.DockerHubAutomatedBuilds, await getStatus('hub_automated_builds_threshold')],
      [Component.DockerHubSecurityScanning, await getStatus('hub_security_scanning_threshold')],
      [Component.DockerWeb, await getStatus('web_threshold')],
      [Component.DockerDocs, await getStatus('docs_threshold')],
      [Component.DockerCommunityForums, await getStatus('community_forums_threshold')],
      [Component.DockerSupportSite, await getStatus('support_site_threshold')]
    ]);

    // Overall
    if (overallThreshold !== undefined && status.result.status_overall.status_code >= overallThreshold) {
      unhealthy.push(`Overall (${getStatusName(status.result.status_overall.status_code)} >= ${getStatusName(overallThreshold)})`);
    }
    switch (status.result.status_overall.status_code) {
      case StatusCode.DegradedPerformance || StatusCode.PartialServiceDisruption: {
        core.warning(`Docker status: ${status.result.status_overall.status}`);
        break;
      }
      case StatusCode.ServiceDisruption || StatusCode.SecurityEvent: {
        core.error(`Docker status: ${status.result.status_overall.status}`);
        break;
      }
      default: {
        core.info(`Docker status: ${status.result.status_overall.status}`);
        break;
      }
    }

    // Components
    if (status.result.status != undefined && status.result.status?.length > 0) {
      core.info(`\n• ${chalk.bold(`Components status`)}`);
      await utilm.asyncForEach(status.result.status, async component => {
        if (!(<any>Object).values(Component).includes(component.id)) {
          core.info(chalk.cyan(`• ${component.name} is not implemented.`));
        }

        if (getStatusName(component.status_code) === undefined) {
          core.warning(`Cannot resolve status ${component.status_code} for ${component.name}`);
          return;
        }

        const compThreshold = componentsThreshold.get(component.id);
        if (compThreshold !== undefined && component.status_code >= compThreshold) {
          unhealthy.push(`${component.name} (${getStatusName(component.status_code)} >= ${getStatusName(compThreshold)})`);
        }

        let compStatusText;
        switch (component.status_code) {
          case StatusCode.Operational: {
            compStatusText = chalk.green('Operational');
            break;
          }
          case StatusCode.DegradedPerformance: {
            compStatusText = chalk.magenta('Degraded performance');
            break;
          }
          case StatusCode.PartialServiceDisruption: {
            compStatusText = chalk.yellow('Partial service disruption');
            break;
          }
          case StatusCode.ServiceDisruption: {
            compStatusText = chalk.red('Service disruption');
            break;
          }
          case StatusCode.SecurityEvent: {
            compStatusText = chalk.red('Security event');
            break;
          }
        }
        core.info(`  • ${compStatusText}${new Array(40 - compStatusText.length).join(' ')} ${component.name}`);
      });

      // Incidents
      if (status.result.incidents != undefined && status.result.incidents?.length > 0) {
        await utilm.asyncForEach(status.result.incidents, async incident => {
          let inccol;
          switch (incident.status_code) {
            case StatusCode.DegradedPerformance: {
              inccol = chalk.magenta;
              break;
            }
            case StatusCode.PartialServiceDisruption: {
              inccol = chalk.yellow;
              break;
            }
            case StatusCode.ServiceDisruption: {
              inccol = chalk.red;
              break;
            }
            case StatusCode.SecurityEvent: {
              inccol = chalk.red;
              break;
            }
            default: {
              inccol = chalk.white;
              break;
            }
          }
          core.info(`\n• ${inccol.bold(incident.name)}`);

          // Incident messages
          await utilm.asyncForEach(incident.messages, async message => {
            const incdate = new Date(message.datetime).toLocaleDateString('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            core.info(`  • ${chalk.gray(incdate)} - ${message.details}`);
          });
        });

        // Check unhealthy
        if (unhealthy.length > 0) {
          core.info(`\n• ${chalk.bgRed(`Unhealthy`)}`);
          await utilm.asyncForEach(unhealthy, async text => {
            core.info(`  • ${text}`);
          });
          core.setFailed(`Docker is unhealthy. Following your criteria, the job has been marked as failed.`);
          return;
        }
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getStatus(input: string): Promise<StatusCode | undefined> {
  const value = core.getInput(input);
  const statusCode = StatusNames.get(value);
  if (value != '' && statusCode === undefined) {
    throw new Error(`Status ${value} does not exist`);
  }
  return statusCode;
}

run();
