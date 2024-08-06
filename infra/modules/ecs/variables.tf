variable "env" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "cognito_identity_pool_id" {
  description = "Cognito identity pool ID"
  type        = string
  default     = "us-east-2:d0190f2f-858b-423a-a8f7-5b27126e58e8"
}

variable "cognito_user_pool_id" {
  description = "Cognito user pool ID"
  type        = string
  default     = "us-east-2_vXgSMyGNJ"
}

variable "exec_role_arn" {
  description = "ARN of the ECS task execution role"
  type        = string
}

variable "load_balancer_sg_id" {
  description = "Security group ID for the load balancer"
  type        = string
}

variable "listener_arn" {
  description = "ARN of the listener for the load balancer"
  type        = string
}

variable "cluster_arn" {
  description = "ARN of the ECS cluster"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for ECS tasks"
  type        = list(string)
}

variable "container_image" {
  description = "Docker image for the application"
  type        = string
}

variable "task_cpu" {
  description = "CPU units for the ECS task"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memory for the ECS task"
  type        = number
  default     = 512
}

variable "service_desired_count" {
  description = "Desired number of instances of the task to run"
  type        = number
  default     = 1
}

variable "force_new_deployment" {
  description = "Force a new deployment of the task definition"
  type        = bool
  default     = true
}
