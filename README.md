# kb-tenant-service

## Overview

The `kb-tenant-service` is a sample microservice for managing tenant information. This repository serves as an example of a control plane microservice in a SaaS framework, with all the necessary infrastructure to launch an API in ECS into a designated VPC.

## Infrastructure

This repository includes the following infrastructure components:

**ECR Image**: The `kb-tenant-service` image is stored in an ECR repository.
**ECS Service**: The `kb-tenant-service` is deployed as an ECS service.
**Load Balancer Rule**: The service is exposed through a load balancer rule.

## CI/CD

This project uses GitHub Actions for CI/CD. The pipeline is triggered on push or pull request to the `main` or `dev` branches. You can also manually trigger the pipeline using the `/cicd` endpoint.

### Dependencies

- **Terraform**: The pipeline requires Terraform to be installed and configured.
- **AWS CLI**: The AWS CLI must be configured with appropriate credentials.
- **GitHub Secrets**: The following secrets must be set in the GitHub repository:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `PAT` (Personal Access Token for GitHub)

### Pipeline Steps

1. **Build and Push Docker Image**:

   - The `ECR-Push` job in the GitHub Actions workflow builds the Docker image for the microservice.
   - The Docker image is then pushed to the Amazon Elastic Container Registry (ECR).

2. **Terraform Apply**:
   - The `Terraform` job in the GitHub Actions workflow applies the Terraform configuration to deploy the infrastructure.
   - This includes creating or updating resources such as ECS tasks, services, load balancers, and security groups.
   - The app name is used to retrieve VPC and other configuration details from AWS SSM.
