locals { vpc = var.is_prod_branch == true ? ["prod"] : ["non-prod"] }


##########################################################################################
# (IGNORE) Required, but auto-populated via the upstream pipeline & your team CI variables
##########################################################################################

variable "region" { default = "us-east-2" } # region in which your resources will be built
variable "role" { type = string }           # cicd builder role
variable "dest_account_number" { type = string }

# # Variables that are used broadly for all build patterns
# variable "eventbridge_role" {type = string}

# # Variables constructed in the extrapolated pipeline
# variable "ci_project_name" {type = string}
# variable "ci_user_email" {type = string}
# variable "ci_commit_branch" {type = string}
variable "is_prod_branch" { type = bool }
variable "app_name" { type = string }
# variable "additional_inputs" {type = any}

# # Required ecs fargate variables
# variable "cluster" {type = string}
# variable "task_role" {type = string}
# variable "task_secret" {type = string}
# variable "stepfunction_role" {type = string}

# # Required lambda variables
# variable "lambda_role" {type = string}
# variable "ecr_repository" {type = string}

# Retrieve private account subnets
data "aws_vpc" "vpc" {
  filter {
    name   = "tag:Name"
    values = local.vpc
  }
}
data "aws_subnets" "subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
}
data "aws_security_groups" "groups" {
  filter {
    name   = "tag:Name"
    values = ["allow"]
  }
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
}
