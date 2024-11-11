# kb-tenant-service

## Overview

The `kb-tenant-service` is a sample microservice for managing tenant information. This repository serves as an example of a control plane microservice in a SaaS framework, with all the necessary infrastructure to launch an API in ECS into a designated VPC.

## Infrastructure

This repository includes the following infrastructure components:

**ECR Image**: The `kb-tenant-service` image is stored in an ECR repository.
**ECS Service**: The `kb-tenant-service` is deployed as an ECS service.
**Load Balancer Rule**: The service is exposed through a load balancer rule.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
