output "ecs_service_url" {
  description = "ECS service URL"
  value       = module.ecs.service_url
}

# output "api_gateway_deployment_id" {
#   description = "API Gateway Deployment ID"
#   value       = module.api_gateway.deployment_id
# }

# output "api_gateway_vpc_link_id" {
#   description = "API Gateway VPC Link ID"
#   value       = module.api_gateway.vpc_link_id
# }
# Add other relevant outputs
