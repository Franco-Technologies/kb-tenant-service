
output "deployment_id" {
  description = "The ID of the deployment"
  value       = aws_api_gateway_deployment.this.id
}

output "vpc_link_id" {
  description = "The ID of the VPC Link"
  value       = aws_apigatewayv2_vpc_link.this.id
}
