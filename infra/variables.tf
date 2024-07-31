
variable "env" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
  default     = "vpc-12345678"
}

variable "cluster_arn" {
  description = "ECS cluster ARN"
  type        = string
  default     = "arn:aws:ecs:us-west-2:123456789012:cluster/example-cluster"
}

variable "subnet_ids" {
  description = "Subnet IDs"
  type        = list(string)
  default     = ["subnet-12345678", "subnet-23456789"]
}

variable "container_image" {
  description = "Container image"
  type        = string
  default     = "nginx:latest"
}

variable "security_group_id" {
  description = "Security group ID"
  type        = string
  default     = "sg-12345678"
}

variable "load_balance_url" {
  description = "The URL of the load balancer"
  type        = string
  default     = "http://example.com"
}

variable "listener_arn" {
  description = "ARN of the listener for the load balancer"
  type        = string
  default     = "arn:aws:elasticloadbalancing:us-west-2:123456789012:listener/app/example-load-balancer/1234567890123456"
}

variable "rest_api_id" {
  description = "The ID of the API Gateway"
  type        = string
  default     = "api-id"
}

variable "root_resource_id" {
  description = "The ID of the root resource"
  type        = string
  default     = "root-id"
}
