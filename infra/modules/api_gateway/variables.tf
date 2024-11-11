variable "security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for ECS tasks"
  type        = list(string)
}

variable "stage_name" {
  description = "The stage name for the deployment"
  type        = string
  default     = "prod"
}

variable "tags" {
  description = "A map of tags to assign to the resource."
  type        = map(string)
  default     = {}
}

variable "vpc_link_name" {
  description = "The name of the VPC Link"
  type        = string
  default     = "ecs-vpc-link"
}

variable "load_balancer_url" {
  description = "The URL of the load balancer"
  type        = string
}

variable "rest_api_id" {
  description = "The ID of the API Gateway"
  type        = string
}

variable "root_resource_id" {
  description = "The ID of the root resource"
  type        = string
}
