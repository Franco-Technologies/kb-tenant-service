locals { env = var.is_prod_branch == true ? "prod" : "dev" }
locals {
  app_vars_decoded = jsondecode(var.app_vars)
}

module "ecs" {
  source = "./modules/ecs"
  # Environment-specific variables
  env               = local.app_vars_decoded.env
  vpc_id            = local.app_vars_decoded.vpc_id
  cluster_arn       = local.app_vars_decoded.cluster_arn
  subnet_ids        = local.app_vars_decoded.subnet_ids
  container_image   = local.app_vars_decoded.container_image
  security_group_id = local.app_vars_decoded.security_group_id
  listener_arn      = local.app_vars_decoded.listener_arn
}

module "api_gateway" {
  source = "./modules/api_gateway"
  # Environment-specific variables
  stage_name        = local.env
  vpc_link_name     = "ecs-vpc-link"
  load_balancer_url = local.app_vars_decoded.load_balance_url
  rest_api_id       = local.app_vars_decoded.rest_api_id
  root_resource_id  = local.app_vars_decoded.root_resource_id
  tags = {
    Environment = "dev"
    Project     = "example"
  }
}
