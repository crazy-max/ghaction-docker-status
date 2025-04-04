[![GitHub release](https://img.shields.io/github/release/crazy-max/ghaction-docker-status.svg?style=flat-square)](https://github.com/crazy-max/ghaction-docker-status/releases/latest)
[![GitHub marketplace](https://img.shields.io/badge/marketplace-docker--status-blue?logo=github&style=flat-square)](https://github.com/marketplace/actions/docker-status)
[![Test workflow](https://img.shields.io/github/actions/workflow/status/crazy-max/ghaction-docker-status/test.yml?branch=master&label=test&logo=github&style=flat-square)](https://github.com/crazy-max/ghaction-docker-status/actions?workflow=test)
[![Codecov](https://img.shields.io/codecov/c/github/crazy-max/ghaction-docker-status?logo=codecov&style=flat-square)](https://codecov.io/gh/crazy-max/ghaction-docker-status)
[![Become a sponsor](https://img.shields.io/badge/sponsor-crazy--max-181717.svg?logo=github&style=flat-square)](https://github.com/sponsors/crazy-max)
[![Paypal Donate](https://img.shields.io/badge/donate-paypal-00457c.svg?logo=paypal&style=flat-square)](https://www.paypal.me/crazyws)

## About

GitHub Action to check [Docker system status](https://status.docker.com/) in your workflow.

___

* [Features](#features)
* [Usage](#usage)
  * [Basic workflow](#basic-workflow)
  * [Trigger error if Docker services are down](#trigger-error-if-docker-services-are-down)
  * [Trigger error if Docker authentication disrupted](#trigger-error-if-docker-authentication-disrupted)
* [Customizing](#customizing)
  * [inputs](#inputs)
* [Contributing](#contributing)
* [License](#license)

## Features

* Threshold management for each Docker service or global (rollup)
* Display status of all services
* Display active incidents and updates

## Usage

### Basic workflow

The following workflow is purely informative and will only display the current
status of Docker:

![Docker system status](.github/docker-status.png)

```yaml
name: build

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      -
        name: Check Docker Status
        uses: crazy-max/ghaction-docker-status@v3
```

### Trigger error if Docker services are down

In the example below we will set some status thresholds so that the job can
fail if these thresholds are exceeded.

This can be useful if you have an action that publishes to Docker Hub registry
but the service is down.

```yaml
name: build

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@v3
      -
        name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      -
        name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      -
        name: Check Docker Hub Status
        uses: crazy-max/ghaction-docker-status@v3
        with:
          overall_threshold: degraded_performance
          hub_registry_threshold: service_disruption
      -
        name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: user/app:latest
```

### Trigger error if Docker authentication disrupted

```yaml
name: build

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@v3
      -
        name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      -
        name: Check Docker authentication Status
        uses: crazy-max/ghaction-docker-status@v3
        with:
          authentication_threshold: service_disruption
      -
        name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
```

## Customizing

### inputs

Following inputs can be used as `step.with` keys

| Name                              | Type   | Description                                                                         |
|-----------------------------------|--------|-------------------------------------------------------------------------------------|
| `overall_threshold`               | String | Defines threshold for overall status (also called rollup) of Docker to fail the job |
| `hub_registry_threshold`          | String | Defines threshold for Docker Hub Registry to fail the job                           |
| `authentication_threshold`        | String | Defines threshold for Docker Authentication to fail the job                         |
| `hub_web_threshold`               | String | Defines threshold for Docker Hub web to fail the job                                |
| `desktop_threshold`               | String | Defines threshold for Docker Desktop to fail the job                                |
| `billing_threshold`               | String | Defines threshold for Docker Billing to fail the job                                |
| `package_repositories_threshold`  | String | Defines threshold for Docker Package Repositories to fail the job                   |
| `hub_automated_builds_threshold`  | String | Defines threshold for Docker Hub Automated Builds to fail the job                   |
| `hub_security_scanning_threshold` | String | Defines threshold for Docker Hub Security Scanning to fail the job                  |
| `docs_threshold`                  | String | Defines threshold for Docker Docs to fail the job                                   |
| `community_forums_threshold`      | String | Defines threshold for Docker Community Forums to fail the job                       |
| `support_site_threshold`          | String | Defines threshold for Docker Support to fail the job                                |
| `web_threshold`                   | String | Defines threshold for Docker.com Website to fail the job                            |
| `scout_threshold`                 | String | Defines threshold for Docker Scout to fail the job                                  |
| `build_cloud_threshold`           | String | Defines threshold for Docker Build Cloud to fail the job                            |
| `testcontainers_cloud_threshold`  | String | Defines threshold for Testcontainers Cloud to fail the job                          |

> [!NOTE]
> Accepted values for a threshold are `operational`, `degraded_performance`,
> `partial_service_disruption`, `service_disruption`, `security_event`.

## Contributing

Want to contribute? Awesome! The most basic way to show your support is to star
the project, or to raise issues. You can also support this project by [**becoming a sponsor on GitHub**](https://github.com/sponsors/crazy-max)
or by making a [PayPal donation](https://www.paypal.me/crazyws) to ensure this
journey continues indefinitely!

Thanks again for your support, it is much appreciated! :pray:

## License

MIT. See `LICENSE` for more details.
